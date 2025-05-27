'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { updateBookmark } from '@/lib/bookmarks'
import { TagInput } from '@/components/TagInput'
import { addTagToBookmark, removeTagFromBookmark, getBookmarkTags } from '@/lib/tags'
import { Database } from '@/lib/supabase'
import { getFolders } from '@/lib/folders'

type Bookmark = Database['public']['Tables']['bookmarks']['Row']
type Tag = Database['public']['Tables']['tags']['Row']
type Folder = Database['public']['Tables']['folders']['Row']

interface EditBookmarkDialogProps {
  bookmark: Bookmark | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onBookmarkUpdated: () => void
}

export const EditBookmarkDialog = ({ 
  bookmark, 
  open, 
  onOpenChange, 
  onBookmarkUpdated 
}: EditBookmarkDialogProps) => {
  const [loading, setLoading] = useState(false)
  const [folders, setFolders] = useState<Folder[]>([])
  const [formData, setFormData] = useState({
    url: '',
    title: '',
    description: '',
    memo: '',
    folder_id: '',
  })
  const [selectedTags, setSelectedTags] = useState<Tag[]>([])
  const [originalTags, setOriginalTags] = useState<Tag[]>([])

  // 북마크 데이터 로드
  useEffect(() => {
    if (bookmark && open) {
      setFormData({
        url: bookmark.url,
        title: bookmark.title,
        description: bookmark.description || '',
        memo: bookmark.memo || '',
        folder_id: bookmark.folder_id || '',
      })
      
      // 태그 로드
      loadBookmarkTags()
      loadFolders()
    }
  }, [bookmark, open])

  const loadBookmarkTags = async () => {
    if (!bookmark) return
    
    try {
      const tags = await getBookmarkTags(bookmark.id)
      setSelectedTags(tags)
      setOriginalTags(tags)
    } catch (error) {
      console.error('태그 로딩 실패:', error)
    }
  }

  const loadFolders = async () => {
    try {
      const foldersData = await getFolders()
      setFolders(foldersData)
    } catch (error) {
      console.error('폴더 로딩 실패:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!bookmark) return

    setLoading(true)
    try {
      // 북마크 업데이트
      await updateBookmark(bookmark.id, {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        memo: formData.memo.trim() || null,
        folder_id: formData.folder_id || null,
      })

      // 태그 변경사항 처리
      await updateBookmarkTags()

      onOpenChange(false)
      onBookmarkUpdated()
    } catch (error) {
      console.error('북마크 업데이트 실패:', error)
      alert('북마크 업데이트에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const updateBookmarkTags = async () => {
    if (!bookmark) return

    // 제거된 태그들
    const removedTags = originalTags.filter(
      original => !selectedTags.some(selected => selected.id === original.id)
    )

    // 추가된 태그들
    const addedTags = selectedTags.filter(
      selected => !originalTags.some(original => original.id === selected.id)
    )

    // 태그 제거
    for (const tag of removedTags) {
      await removeTagFromBookmark(bookmark.id, tag.id)
    }

    // 태그 추가
    for (const tag of addedTags) {
      await addTagToBookmark(bookmark.id, tag.id)
    }
  }

  if (!bookmark) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>북마크 편집</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="edit-url" className="block text-sm font-medium mb-2">
              URL
            </label>
            <Input
              id="edit-url"
              type="url"
              value={formData.url}
              disabled
              className="bg-gray-50"
            />
            <p className="text-xs text-gray-500 mt-1">URL은 변경할 수 없습니다</p>
          </div>
          
          <div>
            <label htmlFor="edit-title" className="block text-sm font-medium mb-2">
              제목 *
            </label>
            <Input
              id="edit-title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>

          <div>
            <label htmlFor="edit-description" className="block text-sm font-medium mb-2">
              설명
            </label>
            <Textarea
              id="edit-description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          <div>
            <label htmlFor="edit-folder" className="block text-sm font-medium mb-2">
              폴더
            </label>
            <select
              id="edit-folder"
              value={formData.folder_id}
              onChange={(e) => setFormData(prev => ({ ...prev, folder_id: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">폴더 없음</option>
              {folders.map(folder => (
                <option key={folder.id} value={folder.id}>
                  {folder.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="edit-memo" className="block text-sm font-medium mb-2">
              메모
            </label>
            <Textarea
              id="edit-memo"
              placeholder="이 북마크에 대한 메모를 입력하세요"
              value={formData.memo}
              onChange={(e) => setFormData(prev => ({ ...prev, memo: e.target.value }))}
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              태그
            </label>
            <TagInput
              selectedTags={selectedTags}
              onTagsChange={setSelectedTags}
              placeholder="태그를 입력하세요"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.title.trim()}
              className="flex-1"
            >
              {loading ? '저장 중...' : '저장'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { createBookmark } from '@/lib/bookmarks'
import { TagInput } from '@/components/TagInput'
import { addTagToBookmark } from '@/lib/tags'
import { Database } from '@/lib/supabase'

type Tag = Database['public']['Tables']['tags']['Row']

interface AddBookmarkDialogProps {
  onBookmarkAdded: () => void
  selectedFolderId?: string
}

export const AddBookmarkDialog = ({ onBookmarkAdded, selectedFolderId }: AddBookmarkDialogProps) => {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    url: '',
    title: '',
    memo: '',
  })
  const [selectedTags, setSelectedTags] = useState<Tag[]>([])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.url.trim()) return

    setLoading(true)
    try {
      const bookmark = await createBookmark({
        url: formData.url.trim(),
        title: formData.title.trim() || undefined,
        memo: formData.memo.trim() || undefined,
        folder_id: selectedFolderId,
      })

      // 태그 추가
      for (const tag of selectedTags) {
        await addTagToBookmark(bookmark.id, tag.id)
      }

      // 폼 초기화
      setFormData({ url: '', title: '', memo: '' })
      setSelectedTags([])
      setOpen(false)
      onBookmarkAdded()
    } catch (error) {
      console.error('북마크 추가 실패:', error)
      alert('북마크 추가에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-full w-14 h-14 text-2xl">
          +
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>새 북마크 추가</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="url" className="block text-sm font-medium mb-2">
              URL *
            </label>
            <Input
              id="url"
              type="url"
              placeholder="https://example.com"
              value={formData.url}
              onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
              required
            />
          </div>
          
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-2">
              제목 (선택사항)
            </label>
            <Input
              id="title"
              placeholder="자동으로 추출됩니다"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            />
          </div>

          <div>
            <label htmlFor="memo" className="block text-sm font-medium mb-2">
              메모 (선택사항)
            </label>
            <Textarea
              id="memo"
              placeholder="이 북마크에 대한 메모를 입력하세요"
              value={formData.memo}
              onChange={(e) => setFormData(prev => ({ ...prev, memo: e.target.value }))}
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              태그 (선택사항)
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
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.url.trim()}
              className="flex-1"
            >
              {loading ? '추가 중...' : '추가'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 
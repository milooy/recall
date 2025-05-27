'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { getTags, deleteTag, getTagCounts, updateTag } from '@/lib/tags'
import { Database } from '@/lib/supabase'
import { Settings, Edit2, Trash2, X } from 'lucide-react'

type Tag = Database['public']['Tables']['tags']['Row']

interface TagManagerProps {
  onTagsUpdated: () => void
}

export const TagManager = ({ onTagsUpdated }: TagManagerProps) => {
  const [open, setOpen] = useState(false)
  const [tags, setTags] = useState<Tag[]>([])
  const [tagCounts, setTagCounts] = useState<Record<string, number>>({})
  const [editingTag, setEditingTag] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      loadTags()
    }
  }, [open])

  const loadTags = async () => {
    try {
      setLoading(true)
      const [tagsData, countsData] = await Promise.all([
        getTags(),
        getTagCounts()
      ])
      setTags(tagsData)
      setTagCounts(countsData)
    } catch (error) {
      console.error('태그 로딩 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditStart = (tag: Tag) => {
    setEditingTag(tag.id)
    setEditValue(tag.name)
  }

  const handleEditCancel = () => {
    setEditingTag(null)
    setEditValue('')
  }

  const handleEditSave = async (tagId: string) => {
    if (!editValue.trim()) return

    try {
      await updateTag(tagId, editValue.trim())
      
      setEditingTag(null)
      setEditValue('')
      await loadTags()
      onTagsUpdated()
    } catch (error) {
      console.error('태그 업데이트 실패:', error)
      alert('태그 업데이트에 실패했습니다.')
    }
  }

  const handleDelete = async (tag: Tag) => {
    const count = tagCounts[tag.id] || 0
    const message = count > 0 
      ? `"${tag.name}" 태그를 삭제하시겠습니까?\n${count}개의 북마크에서 이 태그가 제거됩니다.`
      : `"${tag.name}" 태그를 삭제하시겠습니까?`

    if (!confirm(message)) return

    try {
      await deleteTag(tag.id)
      await loadTags()
      onTagsUpdated()
    } catch (error) {
      console.error('태그 삭제 실패:', error)
      alert('태그 삭제에 실패했습니다.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="rounded-full">
          <Settings className="w-4 h-4 mr-1" />
          태그 관리
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[70vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>태그 관리</DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="text-center py-8 text-gray-500">
            로딩 중...
          </div>
        ) : tags.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            아직 태그가 없습니다.
          </div>
        ) : (
          <div className="space-y-3">
            {tags.map(tag => (
              <div key={tag.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3 flex-1">
                  {editingTag === tag.id ? (
                    <div className="flex items-center gap-2 flex-1">
                      <Input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleEditSave(tag.id)
                          } else if (e.key === 'Escape') {
                            handleEditCancel()
                          }
                        }}
                        className="flex-1"
                        autoFocus
                      />
                      <Button
                        size="sm"
                        onClick={() => handleEditSave(tag.id)}
                        disabled={!editValue.trim()}
                      >
                        저장
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleEditCancel}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Badge variant="secondary" className="text-sm">
                        {tag.name}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {tagCounts[tag.id] || 0}개 북마크
                      </span>
                    </>
                  )}
                </div>

                {editingTag !== tag.id && (
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEditStart(tag)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(tag)}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="pt-4">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="w-full"
          >
            닫기
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 
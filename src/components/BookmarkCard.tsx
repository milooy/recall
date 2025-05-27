'use client'

import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Database } from '@/lib/supabase'
import { updateLastClicked, deleteBookmark } from '@/lib/bookmarks'
import { Trash2, ExternalLink } from 'lucide-react'
import { HighlightText } from '@/components/HighlightText'

type Bookmark = Database['public']['Tables']['bookmarks']['Row']

interface BookmarkCardProps {
  bookmark: Bookmark
  onBookmarkDeleted: () => void
  searchQuery?: string
}

export const BookmarkCard = ({ bookmark, onBookmarkDeleted, searchQuery = '' }: BookmarkCardProps) => {
  const handleClick = async () => {
    try {
      await updateLastClicked(bookmark.id)
      window.open(bookmark.url, '_blank')
    } catch (error) {
      console.error('클릭 업데이트 실패:', error)
      // 에러가 있어도 링크는 열어줌
      window.open(bookmark.url, '_blank')
    }
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (!confirm('이 북마크를 삭제하시겠습니까?')) return

    try {
      await deleteBookmark(bookmark.id)
      onBookmarkDeleted()
    } catch (error) {
      console.error('북마크 삭제 실패:', error)
      alert('북마크 삭제에 실패했습니다.')
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <Card className="group hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* 메타 이미지 */}
          <div className="flex-shrink-0">
            {bookmark.meta_image ? (
              <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                <Image
                  src={bookmark.meta_image}
                  alt=""
                  fill
                  className="object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                  }}
                />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center">
                <ExternalLink className="w-6 h-6 text-gray-400" />
              </div>
            )}
          </div>

          {/* 북마크 정보 */}
          <div className="flex-1 min-w-0" onClick={handleClick}>
            <h3 className="font-semibold text-gray-900 truncate mb-1">
              <HighlightText text={bookmark.title} searchQuery={searchQuery} />
            </h3>
            
            {bookmark.description && (
              <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                <HighlightText text={bookmark.description} searchQuery={searchQuery} />
              </p>
            )}

            {bookmark.memo && (
              <p className="text-sm text-blue-600 bg-blue-50 rounded px-2 py-1 mb-2">
                💭 {bookmark.memo}
              </p>
            )}

            {/* 태그 표시 */}
            {(bookmark as any).bookmark_tags && (bookmark as any).bookmark_tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {(bookmark as any).bookmark_tags.map((bt: any) => (
                  <Badge key={bt.tags.id} variant="outline" className="text-xs">
                    {bt.tags.name}
                  </Badge>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">
                  {formatDate(bookmark.created_at)}
                </span>
                {bookmark.last_clicked_at !== bookmark.created_at && (
                  <Badge variant="secondary" className="text-xs">
                    최근 방문
                  </Badge>
                )}
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            <p className="text-xs text-gray-400 truncate mt-1">
              {bookmark.url}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 
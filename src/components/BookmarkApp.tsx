'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { signOut } from '@/lib/auth'
import { getBookmarks } from '@/lib/bookmarks'
import { getFolders } from '@/lib/folders'
import { AddBookmarkDialog } from '@/components/AddBookmarkDialog'
import { BookmarkCard } from '@/components/BookmarkCard'
import { FolderManager } from '@/components/FolderManager'
import { Database } from '@/lib/supabase'

type Bookmark = Database['public']['Tables']['bookmarks']['Row']
type Folder = Database['public']['Tables']['folders']['Row']

export const BookmarkApp = () => {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [folders, setFolders] = useState<Folder[]>([])
  const [selectedFolderId, setSelectedFolderId] = useState<string | undefined>()
  const [loading, setLoading] = useState(true)

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('로그아웃 실패:', error)
    }
  }

  const loadData = async () => {
    try {
      setLoading(true)
      const [bookmarksData, foldersData] = await Promise.all([
        getBookmarks(selectedFolderId),
        getFolders()
      ])
      setBookmarks(bookmarksData)
      setFolders(foldersData)
    } catch (error) {
      console.error('데이터 로딩 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [selectedFolderId])

  const filteredBookmarks = bookmarks.filter(bookmark =>
    bookmark.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bookmark.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (bookmark.memo && bookmark.memo.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">북마크</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {user?.email}
            </span>
            <Button variant="outline" onClick={handleSignOut}>
              로그아웃
            </Button>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* 검색창 */}
        <div className="mb-8">
          <Input
            type="text"
            placeholder="북마크 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full max-w-2xl mx-auto text-lg py-6"
          />
        </div>

        {/* 폴더 섹션 */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">폴더</h2>
          <div className="flex gap-2 flex-wrap">
            <Button 
              variant={selectedFolderId ? "outline" : "default"} 
              className="rounded-full"
              onClick={() => setSelectedFolderId(undefined)}
            >
              전체
            </Button>
            {folders.map(folder => (
              <Button
                key={folder.id}
                variant={selectedFolderId === folder.id ? "default" : "outline"}
                className="rounded-full"
                onClick={() => setSelectedFolderId(folder.id)}
              >
                {folder.name}
              </Button>
            ))}
            <FolderManager onFolderCreated={loadData} />
          </div>
        </div>

        {/* 북마크 리스트 */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">북마크</h2>
          {loading ? (
            <div className="text-center py-12 text-gray-500">
              로딩 중...
            </div>
          ) : filteredBookmarks.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              {searchQuery ? '검색 결과가 없습니다.' : '아직 북마크가 없습니다. 첫 번째 북마크를 추가해보세요!'}
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredBookmarks.map(bookmark => (
                <BookmarkCard
                  key={bookmark.id}
                  bookmark={bookmark}
                  onBookmarkDeleted={loadData}
                />
              ))}
            </div>
          )}
        </div>

        {/* 북마크 추가 버튼 */}
        <div className="fixed bottom-8 right-8">
          <AddBookmarkDialog 
            onBookmarkAdded={loadData}
            selectedFolderId={selectedFolderId}
          />
        </div>
      </main>
    </div>
  )
} 
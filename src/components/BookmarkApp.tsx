'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { signOut } from '@/lib/auth'

export const BookmarkApp = () => {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('로그아웃 실패:', error)
    }
  }

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
            <Button variant="outline" className="rounded-full">
              전체
            </Button>
            <Button variant="outline" className="rounded-full">
              + 새 폴더
            </Button>
          </div>
        </div>

        {/* 북마크 리스트 */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">북마크</h2>
          <div className="text-center py-12 text-gray-500">
            아직 북마크가 없습니다. 첫 번째 북마크를 추가해보세요!
          </div>
        </div>

        {/* 북마크 추가 버튼 */}
        <div className="fixed bottom-8 right-8">
          <Button className="rounded-full w-14 h-14 text-2xl">
            +
          </Button>
        </div>
      </main>
    </div>
  )
} 
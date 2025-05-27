'use client'

import { useAuth } from '@/contexts/AuthContext'
import { LoginButton } from '@/components/LoginButton'
import { BookmarkApp } from '@/components/BookmarkApp'

export default function Home() {
  const { user, loading } = useAuth()
  console.log({user})

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">로딩 중...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full mx-auto p-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              북마크 앱
            </h1>
            <p className="text-gray-600">
              심플하고 강력한 북마크 관리
            </p>
          </div>
          <LoginButton />
        </div>
      </div>
    )
  }

  return <BookmarkApp />
}

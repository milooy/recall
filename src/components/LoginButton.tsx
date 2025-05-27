'use client'

import { Button } from '@/components/ui/button'
import { signInWithGoogle } from '@/lib/auth'

export const LoginButton = () => {
  const handleLogin = async () => {
    try {
      await signInWithGoogle()
    } catch (error) {
      console.error('로그인 실패:', error)
    }
  }

  return (
    <Button onClick={handleLogin} className="w-full">
      Google로 로그인
    </Button>
  )
} 
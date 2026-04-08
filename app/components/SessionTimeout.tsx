'use client'

import { useEffect, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'

// 5분 (밀리초 단위)
const TIMEOUT = 5 * 60 * 1000

export default function SessionTimeout() {
  const router = useRouter()
  const pathname = usePathname()

  // 만료 시간 갱신 로직
  const resetTimeout = useCallback(() => {
    const userStr = sessionStorage.getItem('user')
    if (userStr) {
      sessionStorage.setItem('session_expires_at', (Date.now() + TIMEOUT).toString())
    }
  }, [])

  useEffect(() => {
    // 10초마다 세션이 만료되었는지 검사하는 인터벌 실행
    const interval = setInterval(() => {
      const userStr = sessionStorage.getItem('user')
      const expiresAtStr = sessionStorage.getItem('session_expires_at')

      if (userStr && expiresAtStr) {
        const expiresAt = parseInt(expiresAtStr, 10)
        
        // 현재 시간이 만료 시간을 지났다면 로그아웃 처리
        if (Date.now() > expiresAt) {
          sessionStorage.removeItem('user')
          sessionStorage.removeItem('session_expires_at')
          alert('장시간 활동이 없어 자동으로 로그아웃 되었습니다.')
          router.push('/auth?type=login')
        }
      }
    }, 10000)

    return () => clearInterval(interval)
  }, [router])

  useEffect(() => {
    // 페이지 이동, 클릭, 키 누름 등 활동이 있을 때마다 초기화
    resetTimeout()

    window.addEventListener('click', resetTimeout)
    window.addEventListener('keydown', resetTimeout)
    window.addEventListener('scroll', resetTimeout)

    return () => {
      window.removeEventListener('click', resetTimeout)
      window.removeEventListener('keydown', resetTimeout)
      window.removeEventListener('scroll', resetTimeout)
    }
  }, [pathname, resetTimeout])

  return null
}

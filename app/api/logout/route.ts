// app/api/logout/route.ts
import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({ message: '로그아웃 성공' }, { status: 200 })

  // 쿠키 삭제
  response.cookies.set('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0, // 즉시 만료
    path: '/',
  })

  return response
}

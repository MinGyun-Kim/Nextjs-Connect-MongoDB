// app/api/login/route.ts
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import dbConnect from '@/db/dbConnect'
import User from '@/db/models/user'
import { signJwt } from '@/lib/auth'

export async function POST(req: NextRequest) {
  await dbConnect()

  const { username, password, role } = await req.json()

  if (!username || !password || !role) {
    return NextResponse.json({ message: '이메일, 비밀번호, 역할은 필수입니다.' }, { status: 400 })
  }

  // 유저 조회
  const user = await User.findOne({ email: username })
  if (!user) {
    return NextResponse.json({ message: '이메일 또는 비밀번호가 올바르지 않습니다.' }, { status: 401 })
  }

  // 비밀번호 검증
  const isPasswordValid = await bcrypt.compare(password, user.password)
  if (!isPasswordValid) {
    return NextResponse.json({ message: '이메일 또는 비밀번호가 올바르지 않습니다.' }, { status: 401 })
  }

  // role 확인
  if (user.role !== role) {
    return NextResponse.json({ message: '선택한 역할이 일치하지 않습니다.' }, { status: 403 })
  }

  // JWT 발급
  const token = signJwt({
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  })

  // HttpOnly Cookie에 토큰 저장
  const response = NextResponse.json(
    { message: '로그인 성공', user: { email: user.email, role: user.role } },
    { status: 200 }
  )
  response.cookies.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7일
    path: '/',
  })

  return response
}

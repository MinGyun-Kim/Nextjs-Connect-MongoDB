// app/api/signup/route.ts
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import dbConnect from '@/db/dbConnect'
import User from '@/db/models/user'
import { signJwt } from '@/lib/auth'

export async function POST(req: NextRequest) {
  await dbConnect()

  const { name, email, password, role } = await req.json()

  if (!email || !password || !role) {
    return NextResponse.json({ message: '이메일, 비밀번호, 역할은 필수입니다.' }, { status: 400 })
  }

  if (!['analyst', 'doctor'].includes(role)) {
    return NextResponse.json({ message: '유효하지 않은 역할입니다.' }, { status: 400 })
  }

  // 이메일 중복 확인
  const existingUser = await User.findOne({ email })
  if (existingUser) {
    return NextResponse.json({ message: '이미 사용 중인 이메일입니다.' }, { status: 409 })
  }

  // 비밀번호 해시화
  const hashedPassword = await bcrypt.hash(password, 12)

  // 유저 생성
  const user = await User.create({
    nickname: name || '',
    email,
    password: hashedPassword,
    role,
  })

  // JWT 발급
  const token = signJwt({
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  })

  // HttpOnly Cookie에 토큰 저장
  const response = NextResponse.json(
    { message: '회원가입 성공', user: { email: user.email, role: user.role } },
    { status: 201 }
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

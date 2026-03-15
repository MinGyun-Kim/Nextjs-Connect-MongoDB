// app/api/me/route.ts
import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/db/dbConnect'
import User from '@/db/models/user'
import { verifyJwt } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const token = req.cookies.get('token')?.value

  if (!token) {
    return NextResponse.json({ message: '인증이 필요합니다.' }, { status: 401 })
  }

  const payload = verifyJwt(token)
  if (!payload) {
    return NextResponse.json({ message: '유효하지 않은 토큰입니다.' }, { status: 401 })
  }

  await dbConnect()

  const user = await User.findById(payload.userId).select('-password')
  if (!user) {
    return NextResponse.json({ message: '유저를 찾을 수 없습니다.' }, { status: 404 })
  }

  return NextResponse.json(
    {
      user: {
        id: user._id,
        email: user.email,
        nickname: user.nickname,
        role: user.role,
        profile_image_url: user.profile_image_url,
      },
    },
    { status: 200 }
  )
}

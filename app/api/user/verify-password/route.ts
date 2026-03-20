import { NextResponse } from 'next/server'
import dbConnect from '@/db/dbConnect'
import User from '@/db/models/user'
import bcrypt from 'bcryptjs'

/**
 * POST /api/user/verify-password
 * 
 * 마이페이지 정보 수정 전에 사용자가 본인임을 증명하기 위해
 * 현재 비밀번호를 다시 확인하는 API입니다.
 */
export async function POST(req: Request) {
  try {
    await dbConnect()
    const { username, password } = await req.json()

    if (!username || !password) {
      return NextResponse.json({ message: '아이디와 비밀번호를 입력해주세요.' }, { status: 400 })
    }

    // 1. 사용자 조회
    const user = await User.findOne({ username })
    if (!user) {
      return NextResponse.json({ message: '사용자를 찾을 수 없습니다.' }, { status: 404 })
    }

    // 2. 비밀번호 일치 검사
    const isMatch = await bcrypt.compare(password, user.password)
    
    if (isMatch) {
      // 3. 비밀번호가 맞을 경우 유저의 기존 정보(비밀번호 제외)를 클라이언트로 반환해 줍니다.
      const { password: _, ...userData } = user.toObject()
      return NextResponse.json({ valid: true, user: userData }, { status: 200 })
    } else {
      // 4. 비밀번호가 틀리면 거부
      return NextResponse.json({ valid: false, message: '비밀번호가 일치하지 않습니다.' }, { status: 401 })
    }
  } catch (error) {
    console.error('Verify Password Error:', error)
    return NextResponse.json({ message: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}

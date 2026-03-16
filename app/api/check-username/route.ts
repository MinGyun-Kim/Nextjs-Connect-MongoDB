import { NextResponse } from 'next/server'
import dbConnect from '@/db/dbConnect'
import User from '@/db/models/user'

export async function POST(req: Request) {
  try {
    await dbConnect()

    const { username } = await req.json()

    if (!username) {
      return NextResponse.json(
        { message: '아이디를 입력해주세요.' },
        { status: 400 }
      )
    }

    // 아이디 중복 검사
    const existingUser = await User.findOne({ username })

    if (existingUser) {
      return NextResponse.json(
        { isAvailable: false, message: '이미 사용 중인 아이디입니다.' },
        { status: 200 } // 중복된 것도 정상 응답이되 isAvailable 플래그로 구분
      )
    }

    return NextResponse.json(
      { isAvailable: true, message: '사용 가능한 아이디입니다.' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Check Username Error:', error)
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

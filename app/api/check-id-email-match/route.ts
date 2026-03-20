import { NextResponse } from 'next/server'
import dbConnect from '@/db/dbConnect'
import User from '@/db/models/user'

/**
 * POST /api/check-id-email-match
 * 이메일과 아이디(username)가 일치하는 회원이 있는지 확인하는 API입니다.
 * - 일치하면: { found: true } 반환
 * - 일치하지 않으면: { found: false } 반환
 */
export async function POST(req: Request) {
  try {
    // 1. MongoDB 연결
    await dbConnect()

    // 2. 요청 바디에서 아이디와 이메일 추출
    const { username, email } = await req.json()

    // 3. 필수 값이 비어있으면 400 에러 반환
    if (!username || !email) {
      return NextResponse.json({ message: '아이디와 이메일을 모두 입력해주세요.' }, { status: 400 })
    }

    // 4. DB에서 해당 아이디와 이메일을 가진 사용자 조회
    // username과 email 모두 일치하는 유저 찾기
    const user = await User.findOne({ username, email })

    if (!user) {
      // 일치하는 사용자가 없는 경우
      return NextResponse.json({ found: false, message: '등록된 정보와 일치하지 않습니다.' }, { status: 200 })
    }

    // 5. 사용자가 존재하면 일치함(found: true) 반환
    return NextResponse.json({ found: true }, { status: 200 })
  } catch (error) {
    // 서버 내부 오류 처리
    console.error('Check ID & Email Match Error:', error)
    return NextResponse.json({ message: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}

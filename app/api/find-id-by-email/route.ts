import { NextResponse } from 'next/server'
import dbConnect from '@/db/dbConnect'
import User from '@/db/models/user'

/**
 * POST /api/find-id-by-email
 * 이메일 주소로 해당 아이디(username)를 조회하는 API입니다.
 * - 이메일이 존재하면: { found: true, username: "..." } 반환
 * - 이메일이 없으면: { found: false } 반환
 */
export async function POST(req: Request) {
  try {
    // 1. MongoDB 연결
    await dbConnect()

    // 2. 요청 바디에서 이메일 추출
    const { email } = await req.json()

    // 3. 이메일이 비어있으면 400 에러 반환
    if (!email) {
      return NextResponse.json({ message: '이메일을 입력해주세요.' }, { status: 400 })
    }

    // 4. DB에서 해당 이메일을 가진 사용자 조회
    // username 필드만 선택적으로 가져옵니다 (불필요한 데이터 전송 방지)
    const user = await User.findOne({ email }).select('username')

    if (!user) {
      // 이메일에 해당하는 사용자가 없는 경우
      return NextResponse.json({ found: false }, { status: 200 })
    }

    // 5. 사용자가 존재하면 아이디(username)를 반환
    return NextResponse.json({ found: true, username: user.username }, { status: 200 })
  } catch (error) {
    // 서버 내부 오류 처리
    console.error('Find ID by Email Error:', error)
    return NextResponse.json({ message: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}

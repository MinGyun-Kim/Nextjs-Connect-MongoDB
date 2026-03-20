import { NextResponse } from 'next/server'
import dbConnect from '@/db/dbConnect'
import User from '@/db/models/user'
import bcrypt from 'bcryptjs'

/**
 * POST /api/reset-password
 * 인증된 사용자의 비밀번호를 새 비밀번호로 변경하는 API입니다.
 */
export async function POST(req: Request) {
  try {
    // 1. MongoDB 연결
    await dbConnect()

    // 2. 요청 바디에서 정보 추출
    const { username, email, newPassword } = await req.json()

    // 3. 필수값이 있는지 확인
    if (!username || !email || !newPassword) {
      return NextResponse.json({ message: '필수 항목이 누락되었습니다.' }, { status: 400 })
    }

    // 4. 아이디와 이메일이 일치하는 사용자가 있는지 확인
    const user = await User.findOne({ username, email })
    if (!user) {
      return NextResponse.json({ message: '사용자를 찾을 수 없습니다.' }, { status: 404 })
    }

    // 5. 서버에 저장된 기존 비밀번호와 새 비밀번호가 같은지 비교합니다.
    const isSamePassword = await bcrypt.compare(newPassword, user.password)
    if (isSamePassword) {
      // 만약 같다면 400 에러와 함께 isSame 플래그를 내려보내 리액트에서 팝업을 띄울 수 있게 합니다.
      return NextResponse.json(
        { message: '똑같은 비밀번호는 사용할 수 없습니다.', isSame: true },
        { status: 400 }
      )
    }

    // 6. 새 비밀번호 암호화
    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds)

    // 7. 사용자의 비밀번호 업데이트
    user.password = hashedPassword
    await user.save()

    // 8. 성공 응답
    return NextResponse.json({ message: '비밀번호가 성공적으로 변경되었습니다.' }, { status: 200 })
  } catch (error) {
    console.error('Reset Password Error:', error)
    return NextResponse.json({ message: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import dbConnect from '@/db/dbConnect'
import User from '@/db/models/user'
import bcrypt from 'bcryptjs'

/**
 * PUT /api/user/update
 * 
 * 사용자의 프로필 정보(이름, 이메일, 주소, 새로운 비밀번호 등)를 업데이트하는 API입니다.
 */
export async function PUT(req: Request) {
  try {
    await dbConnect()
    const { username, name, email, roadAddress, detailAddress, newPassword } = await req.json()

    if (!username) {
      return NextResponse.json({ message: '아이디가 필요합니다.' }, { status: 400 })
    }

    // 1. 유저 찾기
    const user = await User.findOne({ username })
    if (!user) {
      return NextResponse.json({ message: '사용자를 찾을 수 없습니다.' }, { status: 404 })
    }

    // 2. 전달받은 항목들만 선별적으로 업데이트 진행
    if (name) user.name = name
    if (email) user.email = email
    if (roadAddress !== undefined) user.roadAddress = roadAddress
    if (detailAddress !== undefined) user.detailAddress = detailAddress

    // 3. 만약 '변경할 새 비밀번호'도 같이 입력되었다면 해당 비밀번호 해싱 후 업데이트
    if (newPassword && newPassword.trim() !== '') {
      const saltRounds = 10
      user.password = await bcrypt.hash(newPassword, saltRounds)
    }

    // 4. DB에 변경사항 저장
    await user.save()

    return NextResponse.json({ message: '회원정보가 성공적으로 수정되었습니다.' }, { status: 200 })
  } catch (error) {
    console.error('Update User Info Error:', error)
    return NextResponse.json({ message: '회원정보 수정 중 서버 오류가 발생했습니다.' }, { status: 500 })
  }
}

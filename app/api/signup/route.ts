import { NextResponse } from 'next/server'
import dbConnect from '@/db/dbConnect'
import User from '@/db/models/user'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  try {
    await dbConnect()
    console.log('MongoDB 연결 완료: Sign Up API')

    // 1. 요청 바디 데이터 파싱
    const body = await req.json()
    const {
      name,
      phoneNumber, // 클라이언트에서 보낸 전화번호 데이터 추출
      email,
      birthdate,
      username,
      password,
      roadAddress,
      detailAddress,
      role,
      companyName,
      businessNumber,
    } = body

    // 2. 필수값 누락 체크 (전화번호 포함하여 유효성 검사)
    if (!name || !phoneNumber || !email || !birthdate || !username || !password || !role) {
      return NextResponse.json({ message: '필수 항목이 누락되었습니다.' }, { status: 400 })
    }

    // 3. 중복 사용자 체크 (이메일 및 아이디)
    const existingUserByEmail = await User.findOne({ email })
    if (existingUserByEmail) {
      return NextResponse.json({ message: '이미 존재하는 이메일입니다.' }, { status: 409 })
    }

    const existingUserByUsername = await User.findOne({ username })
    if (existingUserByUsername) {
      return NextResponse.json({ message: '이미 존재하는 아이디입니다.' }, { status: 409 })
    }

    // 4. 비밀번호 암호화 (bcrypt 연동)
    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // 5. 새 유저 DB 생성
    const newUser = await User.create({
      name,
      phoneNumber, // DB에 전화번호 저장
      email,
      birthdate,
      username,
      password: hashedPassword,
      roadAddress,
      detailAddress,
      role,
      companyName,
      businessNumber,
    })

    // 6. 성공 응답
    return NextResponse.json({ message: '회원가입이 성공적으로 완료되었습니다.', user: newUser }, { status: 201 })
  } catch (error) {
    console.error('Signup Error:', error)
    return NextResponse.json({ message: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}

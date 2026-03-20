import { NextResponse } from 'next/server'
import dbConnect from '@/db/dbConnect'
import User from '@/db/models/user'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  try {
    await dbConnect()
    
    const body = await req.json()
    const { username, password, role, companyName, businessNumber } = body

    if (!username || !password || !role) {
      return NextResponse.json({ message: '아이디, 비밀번호, 역할은 필수 항목입니다.' }, { status: 400 })
    }

    // 1. 유저 조회 (아이디와 선택한 역할(일반/판매자)이 일치하는지 확인)
    const user = await User.findOne({ username, role })
    if (!user) {
      return NextResponse.json({ message: '존재하지 않는 사용자이거나 선택한 역할(구매자/판매자)이 일치하지 않습니다.' }, { status: 404 })
    }

    // 2. 비밀번호 검증
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return NextResponse.json({ message: '비밀번호가 일치하지 않습니다.' }, { status: 401 })
    }

    // 3. 판매자일 경우 2차 추가 인증 (회사명 + 사업자 등록 번호)
    if (role === 'seller') {
      if (!companyName || !businessNumber) {
        return NextResponse.json({ message: '판매자 로그인시 회사명과 사업자 등록 번호를 제공해야 합니다.' }, { status: 400 })
      }
      
      if (user.companyName !== companyName || user.businessNumber !== businessNumber) {
        return NextResponse.json({ message: '등록된 회사명 또는 사업자 등록 번호와 일치하지 않습니다.' }, { status: 401 })
      }
    }

    // 4. 로그인 성공 (비밀번호를 제외한 유저 정보를 클라이언트로 전송)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userData } = user.toObject()

    return NextResponse.json({ 
      message: '로그인에 성공했습니다.',
      user: userData
    }, { status: 200 })

  } catch (error) {
    console.error('Login API Error:', error)
    return NextResponse.json({ message: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}

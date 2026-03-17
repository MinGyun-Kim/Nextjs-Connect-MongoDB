import { NextResponse } from 'next/server'
// 글로벌 공유 메모리 스토어에서 인증번호 저장소를 불러옵니다.
import { verificationCodes } from '../verificationStore'

export async function POST(req: Request) {
  try {
    // 1. 프론트엔드에서 사용자가 입력한 이메일과 인증번호를 받습니다.
    const { email, code } = await req.json()

    if (!email || !code) {
      return NextResponse.json({ message: '이메일과 인증번호를 모두 입력해주세요.' }, { status: 400 })
    }

    // 2. 서버 메모리에 해당 이메일로 저장된 인증번호가 있는지 확인합니다.
    const savedCode = verificationCodes.get(email)

    if (!savedCode) {
      // 5분이 지나서 지워졌거나 애초에 보낸 적이 없을 때
      return NextResponse.json(
        { message: '인증번호가 만료되었거나 존재하지 않습니다. 다시 요청해주세요.', isValid: false },
        { status: 400 }
      )
    }

    // 3. 사용자가 입력한 번호와 서버가 저장한 번호가 일치하는지 비교합니다.
    if (savedCode === code) {
      // 인증 성공 시 한 번 쓴 번호는 폐기하여 재사용을 막습니다. (더 안전하게)
      verificationCodes.delete(email)

      return NextResponse.json({ message: '이메일 인증이 완료되었습니다.', isValid: true }, { status: 200 })
    } else {
      // 번호가 다를 때
      return NextResponse.json(
        { message: '인증번호가 일치하지 않습니다. 다시 확인해주세요.', isValid: false },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Email Verification Error:', error)
    return NextResponse.json({ message: '인증 처리 중 오류가 발생했습니다.' }, { status: 500 })
  }
}

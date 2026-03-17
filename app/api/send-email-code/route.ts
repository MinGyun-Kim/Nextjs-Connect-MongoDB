import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

// 글로벌 공유 메모리 스토어에서 인증번호 저장소를 불러옵니다.
import { verificationCodes } from '../verificationStore'

export async function POST(req: Request) {
  try {
    // 1. 프론트엔드에서 보낸 이메일 주소를 받습니다.
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ message: '이메일 주소가 필요합니다.' }, { status: 400 })
    }

    // 2. 6자리 무작위 인증번호를 생성합니다.
    const code = Math.floor(100000 + Math.random() * 900000).toString()

    // 3. 서버 메모리(Map)에 해당 이메일과 인증번호를 짝지어서 5분간 저장합니다.
    verificationCodes.set(email, code)
    setTimeout(
      () => {
        // 5분이 지나면 인증번호를 무효화(삭제)합니다.
        verificationCodes.delete(email)
      },
      5 * 60 * 1000
    )

    // 4. Nodemailer를 사용하여 이메일을 보낼 준비를 합니다.
    // 여기서는 Gmail SMTP 서버를 사용한다고 가정합니다.
    // .env.local에 GMAIL_USER와 GMAIL_PASS를 설정해야 실제 발송이 됩니다.
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER, // 구글 이메일 주소
        pass: process.env.GMAIL_PASS, // 구글 앱 비밀번호
      },
    })

    // 5. 발송할 이메일의 내용을 작성합니다.
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email, // 받을 사람의 이메일
      subject: '[회원가입] 이메일 인증번호 안내', // 이메일 제목
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>회원가입 이메일 인증</h2>
          <p>회원가입을 계속 진행하려면 아래의 6자리 인증번호를 입력창에 입력해주세요.</p>
          <div style="background-color: #f7fafc; padding: 15px; border-radius: 8px; font-size: 24px; letter-spacing: 5px; font-weight: bold; color: #2b6cb0; text-align: center;">
            ${code}
          </div>
          <p style="color: #718096; font-size: 14px; margin-top: 15px;">이 인증번호는 5분 동안만 유효합니다.</p>
        </div>
      `,
    }

    // 6. 이메일을 실제로 발송합니다.
    await transporter.sendMail(mailOptions)

    return NextResponse.json({ message: '인증번호가 전송되었습니다.', success: true }, { status: 200 })
  } catch (error) {
    console.error('Email Sending Error:', error)
    return NextResponse.json({ message: '이메일 전송 중 오류가 발생했습니다.', success: false }, { status: 500 })
  }
}

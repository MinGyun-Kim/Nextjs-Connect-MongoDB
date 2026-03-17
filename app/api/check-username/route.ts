import { NextResponse } from 'next/server'
import dbConnect from '@/db/dbConnect'
import User from '@/db/models/user'

export async function POST(req: Request) {
  try {
    // 1. MongoDB 데이터베이스 연결을 시도합니다. 연결이 되어야 DB에서 정보를 조회할 수 있습니다.
    await dbConnect()
    console.log('MongoDB 연결 완료: Check Username API')

    // 2. 클라이언트(프론트엔드)에서 보낸 요청 본문(body)에서 username 값을 추출합니다.
    const { username } = await req.json()

    // 3. 만약 아이디가 비어있는 채로 요청이 왔다면 400 에러와 함께 메시지를 반환합니다.
    if (!username) {
      return NextResponse.json({ message: '아이디를 입력해주세요.' }, { status: 400 })
    }

    // 4. DB에서 회원 정보 확인: User 컬렉션에서 동일한 username(아이디)을 가진 회원이 있는지 조회합니다.
    const existingUser = await User.findOne({ username })

    // 5. 만약 기존 회원의 아이디와 중복이 된다면 (DB에서 검색 결과가 있다면)
    if (existingUser) {
      return NextResponse.json(
        // 프론트엔드에 사용할 수 없다는 상태(isAvailable: false)와 메시지를 함께 전달합니다.
        { isAvailable: false, message: '이미 사용 중인 아이디입니다.' },
        { status: 200 } // 통신 자체는 성공이므로 200을 반환하고 내부 데이터로 중복 여부를 구분합니다.
      )
    }

    // 6. 만약 중복된 아이디가 없다면 (DB에 해당 아이디가 존재하지 않는다면)
    return NextResponse.json(
      // 프론트엔드에 사용 가능하다는 상태(isAvailable: true)와 메시지를 전달합니다.
      { isAvailable: true, message: '사용 가능한 아이디입니다.' },
      { status: 200 }
    )
  } catch (error) {
    // 7. 서버 내부(DB 등)에서 예기치 못한 에러가 날 경우 500 상태 코드와 에러 메시지를 보냅니다.
    console.error('Check Username Error:', error)
    return NextResponse.json({ message: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}

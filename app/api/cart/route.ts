import { NextResponse } from 'next/server'
import dbConnect from '@/db/dbConnect'
import Cart from '@/db/models/cart'

// 1. 장바구니 상품 담기 API
export async function POST(req: Request) {
  try {
    await dbConnect()
    const { username, productId, quantity = 1 } = await req.json()

    if (!username || !productId) {
      return NextResponse.json({ message: '사용자 정보와 상품 ID가 필요합니다.' }, { status: 400 })
    }

    // 이미 유저의 장바구니에 똑같은 상품이 있는지 확인
    const existingCartItem = await Cart.findOne({ username, productId })

    if (existingCartItem) {
      // 1-1. 이미 있다면 기존 수량에 더하기
      existingCartItem.quantity += quantity
      await existingCartItem.save()
      return NextResponse.json({ message: '장바구니 수량이 추가되었습니다.' }, { status: 200 })
    } else {
      // 1-2. 없다면 새로 장바구니 레코드 등록
      const newCartItem = await Cart.create({
        username,
        productId,
        quantity
      })
      return NextResponse.json({ message: '장바구니에 상품을 담았습니다.', cartItem: newCartItem }, { status: 201 })
    }
  } catch (error) {
    console.error('Add To Cart Error:', error)
    return NextResponse.json({ message: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}

// 2. 유저의 장바구니 목록 조회 API
export async function GET(req: Request) {
  try {
    await dbConnect()
    const { searchParams } = new URL(req.url)
    const username = searchParams.get('username')

    if (!username) {
      return NextResponse.json({ message: '사용자 아이디가 필요합니다.' }, { status: 400 })
    }

    // 장바구니 데이터를 찾을 때, 'productId' 칸에 실제 Product 객체의 상세 정보를 합쳐서(populate) 반환
    const cartItems = await Cart.find({ username }).populate('productId').sort({ createdAt: -1 })

    return NextResponse.json({ cartItems }, { status: 200 })
  } catch (error) {
    console.error('Fetch Cart Error:', error)
    return NextResponse.json({ message: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}

// 3. 유저의 장바구니 상품 개별 삭제 API
export async function DELETE(req: Request) {
  try {
    await dbConnect()
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id') // DB에 저장된 cart item의 고유 _id

    if (!id) {
      return NextResponse.json({ message: '삭제할 장바구니 항목 ID가 누락되었습니다.' }, { status: 400 })
    }

    // _id를 기준으로 하나의 장바구니 아이템을 찾아 삭제
    await Cart.findByIdAndDelete(id)

    return NextResponse.json({ message: '장바구니에서 상품이 성공적으로 삭제되었습니다.' }, { status: 200 })
  } catch (error) {
    console.error('Delete Cart Item Error:', error)
    return NextResponse.json({ message: '삭제 중 서버 오류가 발생했습니다.' }, { status: 500 })
  }
}

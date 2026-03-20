import { NextResponse } from 'next/server'
import dbConnect from '@/db/dbConnect'
import Order from '@/db/models/order'
import Cart from '@/db/models/cart'

// 1. 주문 생성 API (결제 시 1회 발동)
export async function POST(req: Request) {
  try {
    await dbConnect()
    const body = await req.json()
    const { buyerId, buyerName, roadAddress, detailAddress, items, totalAmount, paymentMethod, isCartCheckout } = body

    if (!buyerId || !items || items.length === 0) {
      return NextResponse.json({ message: '주문자 정보 혹은 등록할 상품이 누락되었습니다.' }, { status: 400 })
    }

    // 무통장 입금이면 상태를 '입금 대기중', 그 외는 보통 '결제 완료' 처리
    const initialStatus = paymentMethod === '무통장 입금' ? '입금 대기중' : '결제 완료'

    const newOrder = await Order.create({
      buyerId,
      buyerName,
      roadAddress,
      detailAddress,
      items,
      totalAmount,
      paymentMethod,
      status: initialStatus
    })

    // 장바구니 화면에서 "전체 상품 구매하기"를 눌렀을 경우: 결제가 끝났으니 장바구니 비우기
    if (isCartCheckout) {
      await Cart.deleteMany({ username: buyerId })
    }

    return NextResponse.json({ message: '주문이 성공적으로 접수되었습니다.', order: newOrder }, { status: 201 })
  } catch (error) {
    console.error('Create Order Error:', error)
    return NextResponse.json({ message: '주문 접수 중 서버 오류가 발생했습니다.' }, { status: 500 })
  }
}

// 2. 구매자의 마이페이지용 주문 내역 목록 조회 (GET /api/orders?buyerId=...)
// 혹은 판매자용 주문 목록 조회 (GET /api/orders?sellerId=...)
export async function GET(req: Request) {
  try {
    await dbConnect()
    const { searchParams } = new URL(req.url)
    const buyerId = searchParams.get('buyerId')
    const sellerId = searchParams.get('sellerId')

    let filter = {}
    if (buyerId) {
      filter = { buyerId } // 구매자가 본인 내역 볼 때
    } else if (sellerId) {
      filter = { 'items.sellerId': sellerId } // 판매자가 본인 상품이 팔린 내역을 볼 때
    } else {
      return NextResponse.json({ message: '조회할 사용자 아이디가 필요합니다.' }, { status: 400 })
    }

    // 최신 주문 내역이 상단으로 올라오게 역순 정렬(-1)
    const orders = await Order.find(filter).sort({ createdAt: -1 })
    
    return NextResponse.json({ orders }, { status: 200 })
  } catch (error) {
    console.error('Fetch Orders Error:', error)
    return NextResponse.json({ message: '주문 내역 조회 중 서버 오류가 발생했습니다.' }, { status: 500 })
  }
}

// 3. 주문 배송 상태 변경 (판매자 전용 권한)
export async function PUT(req: Request) {
  try {
    await dbConnect()
    const { orderId, newStatus } = await req.json()

    if (!orderId || !newStatus) {
      return NextResponse.json({ message: '주문 번호와 변경할 상태값이 필요합니다.' }, { status: 400 })
    }

    const validStatuses = ['입금 대기중', '결제 완료', '배송 준비중', '배송 중', '배송 완료']
    if (!validStatuses.includes(newStatus)) {
      return NextResponse.json({ message: '유효하지 않은 상태값입니다.' }, { status: 400 })
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId, 
      { status: newStatus }, 
      { new: true } // 업데이트된 문서를 즉시 리턴받기 위함
    )

    if (!updatedOrder) {
      return NextResponse.json({ message: '존재하지 않거나 삭제된 주문입니다.' }, { status: 404 })
    }

    return NextResponse.json({ message: '배송 상태가 성공적으로 변경되었습니다.', order: updatedOrder }, { status: 200 })
  } catch (error) {
    console.error('Update Order Status Error:', error)
    return NextResponse.json({ message: '상태 업데이트 중 서버 오류가 발생했습니다.' }, { status: 500 })
  }
}

// 4. 주문(상품 결제) 취소 및 내역 삭제 (DELETE /api/orders?orderId=...)
export async function DELETE(req: Request) {
  try {
    await dbConnect()
    const { searchParams } = new URL(req.url)
    const orderId = searchParams.get('orderId')
    
    if (!orderId) {
      return NextResponse.json({ message: '취소할 주문 ID가 필요합니다.' }, { status: 400 })
    }

    const order = await Order.findById(orderId)
    if (!order) {
      return NextResponse.json({ message: '존재하지 않는 주문입니다.' }, { status: 404 })
    }

    // 이미 물건이 배송 출발해버린 경우(배송 중, 완료)는 강제 취소/삭제 제한
    if (order.status === '배송 중' || order.status === '배송 완료') {
      return NextResponse.json({ 
        message: '택배사로 이미 인계되어 주문을 취소할 수 없습니다. 수령 후 반품 시스템을 이용해주세요.' 
      }, { status: 400 })
    }

    // 환불 처리 로직은 결제 모듈 연동 없이 넘어감. DB 내역에서 단순 삭제
    await Order.findByIdAndDelete(orderId)

    return NextResponse.json({ message: '주문이 성공적으로 취소(삭제)되었습니다.' }, { status: 200 })
  } catch (error) {
    console.error('Cancel Order Error:', error)
    return NextResponse.json({ message: '주문 취소 중 서버 오류가 발생했습니다.' }, { status: 500 })
  }
}


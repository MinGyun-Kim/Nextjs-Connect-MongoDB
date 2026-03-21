import { NextResponse } from 'next/server'
import dbConnect from '@/db/dbConnect'
import Order from '@/db/models/order'

// 매출 통계 조회 API (GET /api/seller/stats?sellerId=...&period=day|month|year)
export async function GET(req: Request) {
  try {
    await dbConnect()
    const { searchParams } = new URL(req.url)
    const sellerId = searchParams.get('sellerId')
    const period = searchParams.get('period') || 'month' // 기본값: 월별

    if (!sellerId) {
      return NextResponse.json({ message: '판매자 아이디가 필요합니다.' }, { status: 400 })
    }

    // 해당 판매자의 상품이 포함된 모든 주문 조회
    // (취소된 주문 제외: '입금 대기중'은 실제 결제 완료 전이므로 집계에서 제외)
    const orders = await Order.find({
      'items.sellerId': sellerId,
      status: { $ne: '입금 대기중' }, // 미확인 입금 건은 통계에서 제외
    }).sort({ createdAt: 1 }) // 과거→현재 정렬 (차트 시간순)

    // ─────────────────────────────────────────────
    // 1. 기간별 매출 집계 (일별 / 월별 / 연별)
    // ─────────────────────────────────────────────
    const salesMap: Record<string, number> = {}

    for (const order of orders) {
      const date = new Date(order.createdAt)

      // 이 주문에서 현재 판매자의 상품만 필터링하여 금액 계산
      const sellerItems = order.items.filter((it: any) => it.sellerId === sellerId)
      const sellerAmount = sellerItems.reduce((sum: number, it: any) => sum + it.price * it.quantity, 0)

      // 기간 포맷 결정
      let key: string
      if (period === 'day') {
        // 일별: YYYY-MM-DD 형식으로 집계 (최근 30일)
        key = date.toISOString().slice(0, 10)
      } else if (period === 'year') {
        // 연별: YYYY 형식으로 집계
        key = String(date.getFullYear())
      } else {
        // 월별(기본): YYYY-MM 형식으로 집계
        key = date.toISOString().slice(0, 7)
      }

      salesMap[key] = (salesMap[key] || 0) + sellerAmount
    }

    // 기간별 필터: 일별은 최근 30일, 월별은 최근 12개월 기준으로 비어있는 구간도 0으로 채움
    const chartData = buildChartData(salesMap, period)

    // ─────────────────────────────────────────────
    // 2. 상품별 판매량 순위 집계
    // ─────────────────────────────────────────────
    const productMap: Record<string, { name: string; quantity: number; revenue: number }> = {}

    for (const order of orders) {
      const sellerItems = order.items.filter((it: any) => it.sellerId === sellerId)
      for (const item of sellerItems) {
        const pid = String(item.productId)
        if (!productMap[pid]) {
          productMap[pid] = { name: item.name, quantity: 0, revenue: 0 }
        }
        productMap[pid].quantity += item.quantity
        productMap[pid].revenue += item.price * item.quantity
      }
    }

    // 판매 수량 기준 내림차순 정렬 → 상위 10개
    const productRanking = Object.entries(productMap)
      .map(([productId, data]) => ({ productId, ...data }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10)

    // ─────────────────────────────────────────────
    // 3. 요약 통계 계산
    // ─────────────────────────────────────────────
    let totalRevenue = 0
    let totalOrders = 0

    // 유니크한 주문 수와 총 매출 계산
    const countedOrderIds = new Set<string>()
    for (const order of orders) {
      const hasSellerItem = order.items.some((it: any) => it.sellerId === sellerId)
      if (hasSellerItem && !countedOrderIds.has(String(order._id))) {
        countedOrderIds.add(String(order._id))
        totalOrders += 1
        const amount = order.items
          .filter((it: any) => it.sellerId === sellerId)
          .reduce((s: number, it: any) => s + it.price * it.quantity, 0)
        totalRevenue += amount
      }
    }

    const avgOrderAmount = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0

    return NextResponse.json({
      chartData,   // [{ label: string, amount: number }]
      productRanking, // [{ productId, name, quantity, revenue }]
      summary: {
        totalRevenue,
        totalOrders,
        avgOrderAmount,
      },
    })
  } catch (error) {
    console.error('Seller Stats Error:', error)
    return NextResponse.json({ message: '통계 조회 중 서버 오류가 발생했습니다.' }, { status: 500 })
  }
}

// ─────────────────────────────────────────────
// 헬퍼: 비어있는 날짜/월/연도를 0으로 채운 차트 데이터 생성
// ─────────────────────────────────────────────
function buildChartData(salesMap: Record<string, number>, period: string) {
  const result: { label: string; amount: number }[] = []
  const now = new Date()

  if (period === 'day') {
    // 최근 10일 구간 생성
    for (let i = 9; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      const key = d.toISOString().slice(0, 10)
      // 레이블: MM/DD 형식으로 표시
      const label = `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`
      result.push({ label, amount: salesMap[key] || 0 })
    }
  } else if (period === 'month') {
    // 최근 12개월 구간 생성
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const label = `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}`
      result.push({ label, amount: salesMap[key] || 0 })
    }
  } else {
    // 연별: salesMap에 있는 연도 + 현재 연도 기준 최근 5년
    const currentYear = now.getFullYear()
    for (let y = currentYear - 4; y <= currentYear; y++) {
      const key = String(y)
      result.push({ label: `${y}년`, amount: salesMap[key] || 0 })
    }
  }

  return result
}

import { NextResponse } from 'next/server'
import dbConnect from '@/db/dbConnect'
import Product from '@/db/models/product'

/**
 * GET /api/products/[id]
 * 
 * 특정 상품의 상세 정보를 DB에서 가져오는 API입니다.
 * URL의 동적 세그먼트([id])를 통해 상품의 고유 ID(_id)를 받아옵니다.
 */
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    // 1. 데이터베이스 연결
    await dbConnect()

    // 2. 파라미터로 전달받은 id를 변수에 저장
    const { id } = params

    // 3. 해당 id를 가진 상품 정보 하나(findOne/findById)를 DB에서 조회
    const product = await Product.findById(id)

    // 4. 만약 상품이 존재하지 않으면 404 에러 반환
    if (!product) {
      return NextResponse.json({ message: '상품을 찾을 수 없습니다.' }, { status: 404 })
    }

    // 5. 상품을 성공적으로 찾았다면 200 성공 응답과 함께 상품 데이터 반환
    return NextResponse.json({ product }, { status: 200 })
  } catch (error) {
    // try 문 안에서 에러가 발생했을 때 서버가 멈추지 않도록 catch 블록이 실행됨
    console.error('Fetch Product Detail Error:', error)
    return NextResponse.json({ message: '상품 상세 조회 중 서버 오류가 발생했습니다.' }, { status: 500 })
  }
}

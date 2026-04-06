import { NextResponse } from 'next/server'
import dbConnect from '@/db/dbConnect'
import Product from '@/db/models/product'

// 상품 등록 API
export async function POST(req: Request) {
  try {
    await dbConnect()
    const body = await req.json()
    const { name, price, category, description, imageUrl, options, sellerId, sellerCompany } = body

    if (!name || price === undefined || !category || !sellerId) {
      return NextResponse.json({ message: '필수 항목이 누락되었습니다.' }, { status: 400 })
    }

    const newProduct = await Product.create({
      name,
      price: Number(price),
      category,
      description,
      imageUrl,
      options: options || [],
      sellerId,
      sellerCompany
    })

    return NextResponse.json({ message: '상품이 성공적으로 등록되었습니다.', product: newProduct }, { status: 201 })
  } catch (error) {
    console.error('Create Product Error:', error)
    return NextResponse.json({ message: '상품 등록 중 서버 오류가 발생했습니다.' }, { status: 500 })
  }
}

// 카테고리별 상품 조회 API
export async function GET(req: Request) {
  try {
    await dbConnect()
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')

    // 카테고리가 주어지면 해당 카테고리 필터링, 없으면 전체 조회
    const filter = category ? { category } : {}
    // 가장 최근에 등록된 순(내림차순)으로 조회
    const products = await Product.find(filter).sort({ createdAt: -1 })

    return NextResponse.json({ products }, { status: 200 })
  } catch (error) {
    console.error('Fetch Products Error:', error)
    return NextResponse.json({ message: '상품 조회 중 서버 오류가 발생했습니다.' }, { status: 500 })
  }
}

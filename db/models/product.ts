import mongoose from 'mongoose'

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    description: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    options: { type: [String], default: [] },
    sellerId: { type: String, required: true }, // 판매자의 username 등 고유 식별자 저장용
    sellerCompany: { type: String, default: '' },
  },
  {
    timestamps: true, // createdAt, updatedAt 자동 생성
    collection: 'product',
  }
)

// 기존에 캐시된 모델이 있다면 삭제하여 스키마 변경사항이 즉시 반영되도록 함 (Next.js HMR 대응)
if (mongoose.models.Product) {
  delete mongoose.models.Product;
}
const Product = mongoose.model('Product', ProductSchema)

export default Product

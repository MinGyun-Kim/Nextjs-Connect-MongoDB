import mongoose from 'mongoose'

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    description: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    sellerId: { type: String, required: true }, // 판매자의 username 등 고유 식별자 저장용
    sellerCompany: { type: String, default: '' },
  },
  {
    timestamps: true, // createdAt, updatedAt 자동 생성
    collection: 'product',
  }
)

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema)

export default Product

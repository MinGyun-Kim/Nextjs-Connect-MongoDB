import mongoose from 'mongoose'

const CartSchema = new mongoose.Schema(
  {
    // 장바구니 주인의 아이디 (username을 기준으로 식별)
    username: { type: String, required: true },
    
    // 어떤 상품을 담았는지 식별하기 위한 상품의 _id
    // 참조를 위해 ObjectId를 사용하고 레퍼런스는 'Product' 컬렉션
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    
    // 장바구니에 담은 상품의 개수 (기본 1개)
    quantity: { type: Number, default: 1 },
  },
  {
    timestamps: true, // 담은 시간(createdAt) 자동 생성
    collection: 'cart',
  }
)

const Cart = mongoose.models.Cart || mongoose.model('Cart', CartSchema)

export default Cart

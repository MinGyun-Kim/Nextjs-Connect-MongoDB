import mongoose from 'mongoose'

const OrderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  selectedOption: { type: String, default: '' },
  imageUrl: { type: String },
  sellerCompany: { type: String },
  sellerId: { type: String, required: true }, // 판매자 확인용
})

const OrderSchema = new mongoose.Schema(
  {
    // 구매자 관련 정보
    buyerId: { type: String, required: true }, // username (구매자 로그인 아이디)
    buyerName: { type: String, required: true }, 
    roadAddress: { type: String, required: true },
    detailAddress: { type: String, default: '' },
    
    // 장바구니 혹은 단품 구매 시 담긴 상품들
    items: [OrderItemSchema],
    
    // 결제 총액
    totalAmount: { type: Number, required: true },
    
    // 결제 수단 (예: '신용카드', '무통장 입금', '카카오페이')
    paymentMethod: { type: String, required: true },
    
    // 주문 상태 현황 트래킹 (enum 적용으로 오타 및 비정상 입력 방지)
    status: { 
      type: String, 
      enum: ['입금 대기중', '결제 완료', '배송 준비중', '배송 중', '배송 완료', '주문 취소'],
      default: '결제 완료' 
    },

    // 취소 사유 저장
    cancelReason: { type: String, default: '' },
  },
  {
    timestamps: true,
    collection: 'order',
  }
)

if (mongoose.models.Order) {
  delete mongoose.models.Order;
}
const Order = mongoose.model('Order', OrderSchema)

export default Order

'use client'

import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { useRouter } from 'next/navigation'

export default function CheckoutPage() {
  const router = useRouter()
  
  // 로그인한 사용자 정보 (주소 기본값 채우기 용도)
  const [currentUser, setCurrentUser] = useState<any>(null)
  
  // 장바구니나 상품페이지에서 넘겨받은 구매할 아이템 목록
  const [checkoutItems, setCheckoutItems] = useState<any[]>([])
  const [isCartCheckout, setIsCartCheckout] = useState(false) // 장바구니에서 넘어온 결제인지 여부 (결제 완료 후 장바구니 비우기 위함)
  
  // 주문/배송지 입력 폼 상태
  const [buyerName, setBuyerName] = useState('')
  const [roadAddress, setRoadAddress] = useState('')
  const [detailAddress, setDetailAddress] = useState('')
  
  // 결제 수단 라디오 버튼 상태
  const [paymentMethod, setPaymentMethod] = useState('신용카드') // 기본값

  // 총 결제 금액 계산
  const totalAmount = checkoutItems.reduce((acc, item) => acc + (item.price * item.quantity), 0)

  // 1. 초기 데이터 세팅 (인증 및 주문할 데이터 파싱)
  useEffect(() => {
    // 유저 확인
    const userStr = sessionStorage.getItem('user')
    if (!userStr) {
      alert('비정상적인 접근이거나 로그아웃 되었습니다.')
      router.push('/auth?type=login')
      return
    }
    const user = JSON.parse(userStr)
    setCurrentUser(user)
    
    // 유저의 기본 정보로 배송지 폼 초기값 채우기
    setBuyerName(user.name || '')
    setRoadAddress(user.roadAddress || '')
    setDetailAddress(user.detailAddress || '')

    // 구매할 품목 확인 (주문 버튼 누를 때 세션 스토리지에 임시 저장해둠)
    const checkoutDataStr = sessionStorage.getItem('checkoutData')
    if (!checkoutDataStr) {
      alert('결제할 상품 정보가 없습니다. 장바구니 혹은 상품 페이지부터 다시 진행해 주세요.')
      router.push('/')
      return
    }
    
    const checkoutData = JSON.parse(checkoutDataStr)
    setCheckoutItems(checkoutData.items || [])
    setIsCartCheckout(checkoutData.isCart || false)
    
  }, [router])

  // 2. 최종 결제 진행 버튼 로직
  const handlePaymentSubmit = async () => {
    if (!buyerName || !roadAddress) {
      return alert('주문자 이름과 기본 배송 주소는 필수 입력 사항입니다.')
    }

    if (!confirm(`총 결제 금액 ${totalAmount.toLocaleString()}원, [${paymentMethod}] 방식으로 결제하시겠습니까?`)) {
      return
    }

    try {
      // 주문 API 호출
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyerId: currentUser.username, // 고유 아이디 저장
          buyerName,
          roadAddress,
          detailAddress,
          items: checkoutItems,
          totalAmount,
          paymentMethod,
          isCartCheckout, // 장바구니 연동 비우기를 위한 플래그
        }),
      })

      const data = await res.json()

      if (res.ok) {
        // 결제가 성공했으므로 임시로 담아둔 checkoutData 폐기
        sessionStorage.removeItem('checkoutData')
        
        // 결제 완료 안내 (무통장 입금일 경우 문구 다름)
        if (paymentMethod === '무통장 입금') {
          alert('주문이 접수되었습니다! (현재 상태: 입금 대기중 ⏳)\n안내된 계좌번호로 입금해주시면 배송이 시작됩니다.\n[테스트 가상 계좌 확인 불필요 - 판매자 앱에서 배송출발 시뮬레이션 가능합니다!]')
        } else {
          alert('결제가 시원하게 완료되었습니다! 🎉 (현재 상태: 결제 완료 ✅)\n판매자가 상품을 확인하고 곧 배송을 준비할 예정입니다.')
        }

        // 결제 완료 후 본인의 마이페이지-주문내역 탭으로 이동 유도
        router.push('/mypage?tab=orders')
      } else {
        alert(data.message || '오류가 발생해 결제가 취소되었습니다.')
      }

    } catch (error) {
      console.error(error)
      alert('결제 망(서버) 통신 중 에러가 발생했습니다.')
    }
  }

  // 데이터 로딩 중 화면 보정
  if (!currentUser || checkoutItems.length === 0) return <LoadingScreen>결제 정보 준비 중...</LoadingScreen>

  return (
    <Container>
      <Title>안전 결제</Title>
      
      <LayoutGrid>
        {/* --- 왼쪽 창: 배송지 & 결제 수단 입력부 --- */}
        <LeftPanel>
          <Section>
            <SectionTitle>배송지 확인</SectionTitle>
            <InputGroup>
              <Label>받으시는 분</Label>
              <InputField 
                type="text" 
                value={buyerName} 
                onChange={e => setBuyerName(e.target.value)} 
                placeholder="이름을 입력하세요" 
              />
            </InputGroup>
            <InputGroup>
              <Label>기본 주소</Label>
              <InputField 
                type="text" 
                value={roadAddress} 
                onChange={e => setRoadAddress(e.target.value)} 
                placeholder="도로명/지번 주소" 
              />
            </InputGroup>
            <InputGroup>
              <Label>상세 주소 (선택)</Label>
              <InputField 
                type="text" 
                value={detailAddress} 
                onChange={e => setDetailAddress(e.target.value)} 
                placeholder="동/호수 등 상세히 적어주세요" 
              />
            </InputGroup>
          </Section>

          <Section>
            <SectionTitle>결제 수단 선택</SectionTitle>
            <RadioGroup>
              <RadioLabel>
                <input 
                  type="radio" 
                  name="payment" 
                  value="신용카드" 
                  checked={paymentMethod === '신용카드'}
                  onChange={e => setPaymentMethod(e.target.value)}
                />
                💳 신용/체크카드
              </RadioLabel>
              <RadioLabel>
                <input 
                  type="radio" 
                  name="payment" 
                  value="카카오페이" 
                  checked={paymentMethod === '카카오페이'}
                  onChange={e => setPaymentMethod(e.target.value)}
                />
                🟡 카카오페이
              </RadioLabel>
              <RadioLabel>
                <input 
                  type="radio" 
                  name="payment" 
                  value="무통장 입금" 
                  checked={paymentMethod === '무통장 입금'}
                  onChange={e => setPaymentMethod(e.target.value)}
                />
                🏦 무통장 입금 (가상계좌)
              </RadioLabel>
            </RadioGroup>
            {/* 무통장 입금 선택 시 보여줄 안내 문구 */}
            {paymentMethod === '무통장 입금' && (
              <InfoText>
                * 무통장 입금을 선택하시면 <b>[입금 대기중]</b> 상태로 분리되며, 나중에 판매자가 돈을 받은 것을 확인해야 배송이 시작됩니다.
              </InfoText>
            )}
          </Section>
        </LeftPanel>

        {/* --- 오른쪽 창: 주문할 상품과 최종 금액 확인부 --- */}
        <RightPanel>
          <SummaryCard>
            <SectionTitle>주문 상품 정보 ({checkoutItems.length}종)</SectionTitle>
            
            <OrderItemsList>
              {checkoutItems.map((item, idx) => (
                <ItemRow key={idx}>
                  <img src={item.imageUrl || ''} alt="상품썸네일" />
                  <div className="info">
                    <p className="name">{item.name}</p>
                    {item.selectedOption && <p className="option">옵션: {item.selectedOption}</p>}
                    <p className="qty">{item.quantity}개 / {(item.price * item.quantity).toLocaleString()}원</p>
                  </div>
                </ItemRow>
              ))}
            </OrderItemsList>

            <Divider />

            <TotalAmountRow>
              <span>총 결제금액</span>
              <span className="amount">{totalAmount.toLocaleString()}원</span>
            </TotalAmountRow>

            <PayButton onClick={handlePaymentSubmit}>
              {totalAmount.toLocaleString()}원 확실하게 결제하기
            </PayButton>
          </SummaryCard>
        </RightPanel>
      </LayoutGrid>
    </Container>
  )
}

// ---------------- Styled Components ----------------
const LoadingScreen = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 50vh;
  font-size: 1.2rem;
  color: #718096;
`

const Container = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 3rem 1.5rem;
`

const Title = styled.h2`
  text-align: center;
  font-size: 2rem;
  font-weight: 800;
  color: #2d3748;
  margin-bottom: 2.5rem;
`

const LayoutGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;

  @media (max-width: 800px) {
    grid-template-columns: 1fr; /* 모바일에선 위아래로 떨어짐 */
  }
`

const LeftPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`

const Section = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
`

const SectionTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #edf2f7;
  padding-bottom: 0.8rem;
`

const InputGroup = styled.div`
  margin-bottom: 1.5rem;
`

const Label = styled.label`
  display: block;
  font-size: 0.95rem;
  font-weight: 600;
  color: #4a5568;
  margin-bottom: 0.5rem;
`

const InputField = styled.input`
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #cbd5e0;
  border-radius: 8px;
  font-size: 1rem;
  padding-left: 1rem;
  
  &:focus {
    outline: none;
    border-color: #3182ce;
    box-shadow: 0 0 0 1px #3182ce;
  }
`

const RadioGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  font-size: 1.1rem;
  font-weight: 500;
  color: #4a5568;
  cursor: pointer;
  padding: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  transition: all 0.2s;

  &:hover {
    background: #f7fafc;
  }
  
  /* 라디오 버튼 크기 키우기 */
  input[type="radio"] {
    width: 20px;
    height: 20px;
    accent-color: #2b6cb0;
  }
`

const InfoText = styled.p`
  margin-top: 1rem;
  font-size: 0.9rem;
  color: #e53e3e;
  line-height: 1.5;
  background: #fff5f5;
  padding: 1rem;
  border-radius: 8px;
`

/* 오른쪽 구매내역 사이드바 패널 */
const RightPanel = styled.div``

const SummaryCard = styled.div`
  position: sticky; /* 스크롤을 내려도 따라오게 함 */
  top: 2rem;
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.08);
`

const OrderItemsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 350px; /* 상품 개수가 많으면 내부 패널 안에서만 스크롤되도록 */
  overflow-y: auto;
`

const ItemRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;

  img {
    width: 60px;
    height: 60px;
    object-fit: cover;
    border-radius: 8px;
    border: 1px solid #edf2f7;
  }

  .info {
    flex: 1;
    .name {
      font-size: 0.95rem;
      font-weight: 600;
      color: #2d3748;
      margin: 0 0 0.2rem 0;
      /* 긴 상품명은 점표시 자르기 */
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 140px; 
    }
    .option {
      font-size: 0.85rem;
      color: #4a5568;
      margin: 0 0 0.2rem 0;
    }
    .qty {
      font-size: 0.9rem;
      color: #718096;
      margin: 0;
    }
  }
`

const Divider = styled.hr`
  border: none;
  border-top: 1px dashed #cbd5e0;
  margin: 1.5rem 0;
`

const TotalAmountRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1.1rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 2rem;

  .amount {
    font-size: 1.5rem;
    color: #e53e3e;
  }
`

const PayButton = styled.button`
  width: 100%;
  padding: 1.2rem;
  background-color: #2b6cb0;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.2rem;
  font-weight: 800;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #2c5282;
  }
`

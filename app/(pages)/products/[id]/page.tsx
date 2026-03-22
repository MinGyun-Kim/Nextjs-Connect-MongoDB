'use client'

// React Hook 의존성 및 Next.js 라우팅 최적화를 위한 모듈 임포트
import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import styled from 'styled-components'

/**
 * ProductDetail 페이지 컴포넌트
 * 
 * 기능: 메인 홈 화면 등에서 특정 상품을 클릭했을 때 나타나는 상품 상세 정보 화면입니다.
 * URL을 통해 특정 상품의 식별자(id)를 전달받아, '/api/products/[id]'에서 데이터를 불러옵니다.
 * 화면에는 상품의 이미지, 이름, 판매 가격, 판매 상점 이름(회사명), 그리고 상세 설명이 노출됩니다.
 */
export default function ProductDetail() {
  const router = useRouter()
  // useParams를 통해 현재 URL의 동적 경로 [id]에 매핑된 값을 꺼내옵니다.
  const params = useParams()
  // URL에서 전달받은 식별자를 문자열 변수로 고정
  const productId = params?.id as string

  // 상품 정보를 저장할 최상단 상태(State). 로딩 전일 수 있으므로 null 허용
  // 타입스크립트로 product 안에 들어갈 항목들의 자료형을 정의합니다.
  const [product, setProduct] = useState<{
    _id: string
    name: string
    price: number
    category: string
    description: string
    imageUrl: string
    sellerId: string
    sellerCompany: string
  } | null>(null)

  // 데이터를 불려오는 동안 화면에 '로딩 중' UI를 보여주기 위한 상태
  const [isLoading, setIsLoading] = useState(true)

  // 컴포넌트가 처음 화면에 나타날 때(Mount) 1회만, 혹은 productId가 변경될 때마다 실행될 함수
  useEffect(() => {
    // 상품의 고유 ID가 전달되지 않았다면 불러올 데이터가 없으므로 그대로 종료
    if (!productId) return

    // 비동기로 서버에 상품 하나의 상세 정보를 요청하는 함수 정의
    const fetchProductDetail = async () => {
      try {
        // GET '/api/products/[id]' 경로로 요청
        const res = await fetch(`/api/products/${productId}`)
        const data = await res.json()

        // 응답 상태가 200번대(정상)라면 product 상태를 업데이트
        if (res.ok) {
          setProduct(data.product)
        } else {
          // 상품이 없거나 서버에서 조회를 실패했을 때 경고창 띄움
          alert(data.message || '상품을 불러오는 데 실패했습니다.')
        }
      } catch (error) {
        // 클라이언트 네트워크 또는 접속 상의 에러 처리
        console.error('상세 조회 에러:', error)
        alert('서버 응답을 받는 데 실패했습니다.')
      } finally {
        // 요청이 성공이든 실패든, API 통신이 끝났으므로 로딩 상태는 해제
        setIsLoading(false)
      }
    }

    // 작성한 함수를 렌더링 후 1회 실행
    fetchProductDetail()
  }, [productId]) // 배열 안의 변수가 달라질 때마다 useEffect 재실행

  // --- 장바구니 담기 로직 ---
  const handleAddToCart = async () => {
    // 1. 유저 로그인 상태 확인 (로컬스토리지 기반 검증)
    const userStr = localStorage.getItem('user')
    if (!userStr) {
      alert('로그인한 회원만 사용할 수 있는 기능입니다. 로그인 페이지로 이동합니다.')
      router.push('/auth?type=login')
      return
    }

    const currentUser = JSON.parse(userStr)

    // 2. 현재 로그인된 유저의 아이디와 상품의 고유 ID를 백엔드로 전송
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: currentUser.username,
          productId: product?._id,
          quantity: 1, // 버튼 클릭 시 1개 담기
        }),
      })

      const data = await res.json()
      
      if (res.ok) {
        // 성공적으로 담았을 때 안내 후 사용자 선택에 따라 장바구니 탭이 있는 마이페이지로 이동 유도
        if (confirm('상품이 방금 스르륵 장바구니에 담겼습니다! 🛒\n지금 바로 내 장바구니 화면으로 가볼까요?')) {
          router.push('/mypage')
        }
      } else {
        alert(data.message || '장바구니 담기에 실패했습니다.')
      }
    } catch (error) {
      console.error(error)
      alert('서버 네트워크 오류가 발생했습니다.')
    }
  }

  // --- 바로 구매하기 로직 ---
  const handleBuyNow = () => {
    const userStr = localStorage.getItem('user')
    if (!userStr) {
      alert('결제는 로그인 후 가능합니다.')
      router.push('/auth?type=login')
      return
    }

    if (!product) return

    // 결제창(Checkout)으로 넘길 데이터를 조립하여 브라우저 임시 스토리지에 저장
    const checkoutItem = {
      productId: product._id,
      name: product.name,
      price: product.price,
      quantity: 1, // 단일 구매이므로 기본 1개
      imageUrl: product.imageUrl,
      sellerCompany: product.sellerCompany,
      sellerId: product.sellerId,
    }

    sessionStorage.setItem('checkoutData', JSON.stringify({
      items: [checkoutItem],
      isCart: false // 장바구니에서 넘어온 결제가 아니라는 플래그
    }))

    router.push('/checkout')
  }

  // 데이터를 불러오는 중일 때의 렌더링 화면
  if (isLoading) {
    return <LoadingContainer>상품 정보를 불러오는 중입니다...</LoadingContainer>
  }

  // 로딩은 끝났는데도 product 정보가 비어있다면 상품이 없는 것이므로 예외 UI 렌더링
  if (!product) {
    return (
      <EmptyContainer>
        <h3>존재하지 않거나 삭제된 상품입니다.</h3>
        {/* '돌아가기' 버튼으로 이전 화면으로 이동 */}
        <BackButton onClick={() => router.back()}>뒤로 가기</BackButton>
      </EmptyContainer>
    )
  }

  // --- 실제 조회된 상품 정보를 보여주는 상세 페이지 UI 렌더링 ---
  return (
    <PageWrapper>
      {/* 
        상단 네비게이션 헤더 
        이전 페이지로 돌아가는 버튼과 로고 텍스트를 담아줍니다.
      */}
      <TopHeader>
        <BackButton onClick={() => router.back()}>&larr; 돌아가기</BackButton>
        <LogoText onClick={() => router.push('/')}>Ojosama Shop</LogoText>
      </TopHeader>

      {/* 
        상품 상세 화면 컨테이너
        왼쪽은 상품 대표 이미지, 오른쪽은 각종 텍스트 상세 정보로 2단 분리 구성
      */}
      <DetailContainer>
        {/* --- 왼쪽 구역: 이미지 표시 --- */}
        <ImageSection>
          {product.imageUrl ? (
            // 판매자가 사진을 등록한 경우 사진 URL을 그대로 출력
            <MainImage src={product.imageUrl} alt={product.name} />
          ) : (
            // 사진을 등록하지 않았을 경우 처리되는 회색 대체 블록
            <NoImageBox>이미지가 없는 상품입니다</NoImageBox>
          )}
        </ImageSection>

        {/* --- 오른쪽 구역: 정보(Information) 표시 --- */}
        <InfoSection>
          {/* 상품의 등록 카테고리 (예: '의류/패션') */}
          <CategoryBadge>{product.category}</CategoryBadge>
          
          {/* 상품 이름 출력 영역 */}
          <Title>{product.name}</Title>
          
          {/* 상품 가격을 3자리 단위 콤마(,)와 함께 '원' 단위 출력 */}
          <Price>{product.price.toLocaleString()} 원</Price>

          {/* 판매를 담당하는 회사(상점) 이름. 비어있으면 기본값 적용 */}
          <SellerInfo>
            판매처<span>{product.sellerCompany || 'Ojosama Default Seller'}</span>
          </SellerInfo>

          {/* 
            상세 설명 출력부
            판매자가 적은 줄바꿈과 여백 등의 서식을 유지하기 위해 <pre> 태그 스타일을 활용하여 
            보여주기 좋게(white-space: pre-wrap) 표현 
          */}
          <DescriptionBox>
            <h4>상품 상세 설명</h4>
            <DescText>
              {product.description || '판매자가 작성한 상세 설명이 없습니다.'}
            </DescText>
          </DescriptionBox>

          {/* 장바구니/구매 액션 버튼 */}
          <ActionButtons>
            <CartBtn onClick={handleAddToCart}>장바구니 담기</CartBtn>
            <BuyBtn onClick={handleBuyNow}>바로 구매하기</BuyBtn>
          </ActionButtons>
        </InfoSection>
      </DetailContainer>
    </PageWrapper>
  )
}

// ----------------------------------------------------
// 페이지 전용 Styled Components (CSS 요소) 상세 정의
// ----------------------------------------------------

// 로딩 화면 중앙 정렬을 위한 스타일
const LoadingContainer = styled.div`
  display: flex;
  height: 100vh;
  justify-content: center;
  align-items: center;
  font-size: 1.2rem;
  color: #718096;
  background-color: #f7fafc;
`

// 에러, 상품 없음 화면 중앙 정렬 
const EmptyContainer = styled(LoadingContainer)`
  flex-direction: column;
  gap: 1.5rem;
  h3 { color: #2d3748; }
`

// 전체 화면의 회색 배경 레이아웃 박스
const PageWrapper = styled.div`
  min-height: 100vh;
  background-color: #f8fafc; /* 밝은 회청색 톤 */
`

// 헤더: [돌아가기 버튼]과 쇼핑몰 임시 [상단 로고] 배치
const TopHeader = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 3rem;
  background-color: #ffffff;
  border-bottom: 1px solid #e2e8f0;
`

// 뒤로가기 화살표 버튼 모양 꾸미기
const BackButton = styled.button`
  background: transparent;
  border: none;
  font-size: 1rem;
  font-weight: 600;
  color: #4a5568;
  cursor: pointer;
  padding: 0.5rem 1rem;
  border-radius: 6px;

  &:hover {
    background-color: #edf2f7;
    color: #2d3748;
  }
`

// 로고 텍스트 버튼 꾸미기
const LogoText = styled.h1`
  font-size: 1.4rem;
  font-weight: 800;
  color: #2d3748;
  margin: 0;
  cursor: pointer;
  letter-spacing: -0.5px;
`

// 이미지와 정보를 양옆으로 분할해주는 레이아웃
const DetailContainer = styled.main`
  display: flex;
  max-width: 1100px;
  margin: 3rem auto;          /* 화면 중앙 정렬, 마진 3rem 여백 */
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05); /* 고급스러운 흐린 그림자 */
  overflow: hidden;

  /* 화면 폭이 모바일, 태블릿 수준(작아지면)이면 세로로 차곡차곡 쌓임 */
  @media (max-width: 800px) {
    flex-direction: column;
    margin: 1.5rem;
  }
`

// 상품 사진 구역 (왼쪽 절반)
const ImageSection = styled.div`
  flex: 1;                     /* 좌우 비율 1:1 로 동등하게 나눔 */
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f7fafc;   /* 사진이 남는 공간에 들어갈 연한 톤의 배경색 */
  padding: 2rem;
`

// 실제 사진 img 태그의 속성들
const MainImage = styled.img`
  width: 100%;                 /* 속해있는 ImageSection 너비를 전적으로 채움 */
  max-width: 500px;
  aspect-ratio: 1/1;           /* 1대1 정사각형 출력 고정 */
  object-fit: contain;         /* 사진이 잘리지 않고 다 보이도록 contain 속성 부여 */
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
`

// 이미지가 없을 때 등장할 대체 상자
const NoImageBox = styled.div`
  width: 100%;
  max-width: 500px;
  aspect-ratio: 1/1;
  background-color: #edf2f7;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  color: #a0aec0;
  border-radius: 8px;
  font-weight: 500;
`

// 상세 정보 컨텐츠 구역 (오른쪽 절반)
const InfoSection = styled.div`
  flex: 1.2;                   /* 사진부보다 텍스트부가 살짝 넓게 비율 1.2 등분 */
  padding: 3rem 2.5rem;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
`

// 카테고리명 표시용 뱃지 스타일 박스 (예: "식품/음료" 파란 캡슐)
const CategoryBadge = styled.span`
  display: inline-block;
  align-self: flex-start;
  padding: 0.4rem 0.8rem;
  background-color: #ebf8ff;
  color: #2b6cb0;
  font-size: 0.85rem;
  font-weight: 700;
  border-radius: 999px; /* 완전 둥큰 알약 형태 */
  margin-bottom: 1rem;
`

// 상품 제목 디자인
const Title = styled.h2`
  font-size: 1.8rem;
  font-weight: 800;
  color: #1a202c;
  margin: 0 0 1rem 0;
  line-height: 1.3;
`

// 상품 가격 디자인, 시각적으로 강한 빨간색을 주어 눈에 쉽게 띔
const Price = styled.div`
  font-size: 2rem;
  font-weight: 800;
  color: #e53e3e;
  margin-bottom: 1.5rem;
  letter-spacing: -0.5px;
`

// 회사(상점)명 강조 텍스트. 회색 바탕에 연한 정보 전달
const SellerInfo = styled.div`
  font-size: 0.95rem;
  color: #718096;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e2e8f0; /* 정보란과 설명란의 시각적 경계선 역할 */

  span {
    font-weight: 700;
    color: #4a5568;
    margin-left: 0.4rem;
  }
`

// 제품 상세설명란 전체 테두리 상자
const DescriptionBox = styled.div`
  flex: 1; /* 정보창 내에서 남은 높이만큼 차지하도록 부여 */
  
  h4 {
    font-size: 1.1rem;
    color: #2d3748;
    margin-bottom: 1rem;
  }
`

// 줄바꿈이 그대로 살아나는 프리-랩 적용 텍스트 문구
const DescText = styled.div`
  font-size: 1rem;
  color: #4a5568;
  line-height: 1.7;
  white-space: pre-wrap; /* 판매자가 엔터(Enter)쳐서 작성한 문단을 화면에 그대로 보존하여 출력 */
`

// 쇼핑몰 느낌을 주기 위한 가짜 하단 구매/장바구니 버튼 그룹
const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 3rem;
`

// 장바구니 버튼 공통 골격 (흰 바탕)
const CartBtn = styled.button`
  flex: 1;
  padding: 1.2rem;
  background-color: #ffffff;
  color: #2d3748;
  border: 2px solid #cbd5e0;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #2d3748;
    background-color: #f7fafc;
  }
`

// 구매 버튼 공통 골격 (검은 바탕 대비효과 부여)
const BuyBtn = styled.button`
  flex: 1;
  padding: 1.2rem;
  background-color: #2d3748;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #1a202c;
  }
`

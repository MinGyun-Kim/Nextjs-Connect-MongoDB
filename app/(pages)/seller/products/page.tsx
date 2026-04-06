'use client' // 클라이언트 환경(브라우저)에서 렌더링되도록 선언 (상태 관리, 이벤트 사용을 위함)

import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { useRouter } from 'next/navigation'

export default function SellerProductManagement() {
  const router = useRouter()
  // isAuthorized: 권한 확인 중엔 null, 통과 시 true, 실패 시 false 상태를 관리
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)

  // --- 폼(Form) 요소의 상태(State) 관리 ---
  const [productName, setProductName] = useState('') // 상품명
  const [productPrice, setProductPrice] = useState('') // 판매 가격
  const [category, setCategory] = useState('') // 드롭다운으로 선택할 카테고리 종류
  const [productDesc, setProductDesc] = useState('') // 상품 상세 설명
  const [imagePreview, setImagePreview] = useState<string | null>(null) // 업로드한 이미지 화면 미리보기 데이터 URL
  const [productOptions, setProductOptions] = useState('') // 쉼표로 구분할 상품 옵션

  // 드롭다운에 노출될 기본 8가지 메인 카테고리 옵션 리스트
  const categoryOptions = [
    '의류/패션', '뷰티/화장품', '전자기기', '가전제품', 
    '식품/음료', '가구/인테리어', '스포츠/레저', '도서/음반'
  ]

  // --- 페이지 로드 시(혹은 새로고침 시) 판매자 권한을 체크하는 Effect ---
  useEffect(() => {
    const checkAuth = () => {
      // localStorage에 저장된 'user' 정보를 꺼내옵니다.
      const userStr = localStorage.getItem('user')
      if (userStr) {
        try {
          const user = JSON.parse(userStr)
          // 유저 역할이 'seller'(판매자)인 경우에만 인가(true) 처리
          if (user.role === 'seller') {
            setIsAuthorized(true)
            return
          }
        } catch (e) {
          console.error('유저 권한 파싱 오류:', e)
        }
      }
      // 정보가 없거나 'general'(일반회원)인 경우 거부 처리 및 경고
      setIsAuthorized(false)
      alert('판매자 권한이 필요합니다.')
      router.push('/auth?type=login') // 권한이 없으므로 로그인 페이지로 강제 이동
    }
    checkAuth()
  }, [router])

  // --- 이미지 업로드 핸들러 ---
  // 파일 선택 창에서 이미지를 골랐을 때 브라우저 화면에 미리 띄워주기(프리뷰) 위한 함수
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      // 이미지 파일을 다 읽어들이면 작동하는 이벤트 리스너
      reader.onloadend = () => {
        setImagePreview(reader.result as string) // 읽어들인 URL 문자열을 미리보기 상태에 세팅
      }
      reader.readAsDataURL(file) // 파일을 Base64 데이터 URL 형식으로 읽기 명령
    }
  }

  // --- [상품 등록하기] 폼 제출 핸들러 ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault() // 기본적으로 새로고침 되는 submit 이벤트 방지
    
    // 1. 필수 항목들이 비어있지 않은지 검사
    if (!productName || !productPrice || !category) {
      return alert('필수 항목(상품명, 가격, 카테고리)을 모두 입력해주세요.')
    }
    
    // 유저 정보 가져오기 (판매자 식별용)
    const userStr = localStorage.getItem('user')
    const user = userStr ? JSON.parse(userStr) : null
    
    // 2. 백엔드(DB 연동 API) 호출을 통해 상품 등록
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: productName,
          price: productPrice,
          category,
          description: productDesc,
          imageUrl: imagePreview || '', // base64 문자열 그대로 저장 (프로토타입용 간이 방법)
          options: productOptions ? productOptions.split(',').map(opt => opt.trim()).filter(Boolean) : [],
          sellerId: user?.username || 'unknown',
          sellerCompany: user?.companyName || ''
        })
      })

      const data = await res.json()
      
      if (res.ok) {
        alert(`[${category}] ${productName} 상품이 성공적으로 등록되었습니다!`)
        // 3. 상품 등록이 성공했다고 가정하고 작성해둔 입력 폼들을 깨끗이 초기화(초기 상태로 변경)
        setProductName('')
        setProductPrice('')
        setCategory('')
        setProductDesc('')
        setProductOptions('')
        setImagePreview(null)
      } else {
        alert(data.message || '상품 등록에 실패했습니다.')
      }
    } catch (error) {
      console.error(error)
      alert('서버 등록 중 오류가 발생했습니다.')
    }
  }

  // 페이지에 진입하거나 권한을 체크하는 찰나의 순간 동안 보여줄 로딩 화면 (화면 번쩍임 방지)
  if (isAuthorized === null || isAuthorized === false) {
    return <LoadingScreen>권한 확인 중...</LoadingScreen>
  }

  // --- 본격적인 판매자 관리 페이지 화면(UI) 렌더링 시작 ---
  return (
    <DashboardContainer>
      {/* [1] 왼쪽 사이드바 (Seller Dashboard 공통) */}
      <Sidebar>
        {/* 판매자 센터 로고. 누르면 상점 메인 홈('/')으로 이동 */}
        <SidebarLogo onClick={() => router.push('/')}>Ojosama Seller</SidebarLogo>
        <NavList>
          {/* 대시보드 메인으로 돌아가는 버튼 */}
          <NavItem onClick={() => router.push('/seller')}>대시보드</NavItem>
          {/* 현재 위치한 탭이므로 'active' 클래스를 주어 파란색으로 강조 */}
          <NavItem className="active" onClick={() => router.push('/seller/products')}>상품 관리</NavItem>
          <NavItem>주문 배송 관리</NavItem>
          <NavItem>매출 통계</NavItem>
          <NavItem onClick={() => router.push('/seller/profile')}>정보 수정</NavItem>
        </NavList>
        <SidebarFooter>
          {/* 하단 로그아웃 버튼 (로컬 스토리지 비우고 로그인창 이동) */}
          <LogoutButton
            onClick={() => {
              localStorage.removeItem('user')
              router.push('/auth?type=login')
            }}
          >
            로그아웃
          </LogoutButton>
        </SidebarFooter>
      </Sidebar>

      {/* [2] 메인 콘텐츠 영역 (오른쪽 넓은 공간) */}
      <MainContent>
        {/* 상단 헤더: 타이틀과 판매자 웰컴 인삿말 */}
        <Header>
          <HeaderTitle>상품 관리 / 등록</HeaderTitle>
          <UserInfo>
            <Avatar>👨‍💼</Avatar>
            <span>판매자님 환영합니다</span>
          </UserInfo>
        </Header>

        {/* 
          상품을 등록하는 실제 폼 단위 영역입니다.
          가운데 정렬된 하나의 긴 흰색 배경 블록(Card 형식)을 사용합니다.
        */}
        <FormSection onSubmit={handleSubmit}>
          <SectionTitle>신규 상품 등록</SectionTitle>

          <FormGrid>
            {/* --- 왼쪽 열: 상품 대표 이미지 업로드 구역 --- */}
            <ImageUploadArea>
              <Label>상품 대표 이미지</Label>
              {/* 이미지가 들어있으면 점선을 투명하게(사라지게), 없으면 회색 점선으로 표시 */}
              <ImagePreviewBox $hasImage={!!imagePreview}>
                {imagePreview ? (
                  // state에 등록된 base64 이미지가 있다면 화면에 렌더링
                  <img src={imagePreview} alt="미리보기" />
                ) : (
                  // 선택된 사진이 없을 때 표시되는 빈 박스 디자인
                  <EmptyImageBox>
                    <UploadIcon>📷</UploadIcon>
                    <span>이미지를 업로드하세요</span>
                  </EmptyImageBox>
                )}
                {/* 
                  화면에 보이지 않지만 전체 박스를 클릭했을 때 
                  파일 탐색기가 띄워지도록 하는 input[type=file] 태그 
                */}
                <ImageInput 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageChange} 
                />
              </ImagePreviewBox>
            </ImageUploadArea>

            {/* --- 오른쪽 열: 상품 기본 정보 및 옵션 입력 구역 --- */}
            <InputCol>
              {/* 카테고리 선택 란 */}
              <InputGroup>
                <Label>카테고리 <Required>*</Required></Label>
                <SelectField 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="" disabled>카테고리를 선택하세요</option>
                  {categoryOptions.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </SelectField>
              </InputGroup>

              {/* 상품 이름 입력란 */}
              <InputGroup>
                <Label>상품명 <Required>*</Required></Label>
                <InputField 
                  type="text" 
                  placeholder="상품 이름을 입력하세요"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                />
              </InputGroup>

              {/* 판매 가격 입력란 (숫자만, 그리고 오른쪽에 '원' 텍스트 고정) */}
              <InputGroup>
                <Label>판매 가격 <Required>*</Required></Label>
                <PriceInputWrapper>
                  <InputField 
                    type="number" 
                    placeholder="숫자만 입력 (예: 15000)"
                    value={productPrice}
                    onChange={(e) => setProductPrice(e.target.value)}
                    min="0"
                  />
                  <PriceUnit>원</PriceUnit>
                </PriceInputWrapper>
              </InputGroup>

              {/* 상품 상세 설명 입력 (여러 줄이 입력 가능한 textarea) */}
              <InputGroup style={{ flex: 1 }}>
                <Label>상세 설명</Label>
                <TextAreaField 
                  placeholder="상품에 대한 장점이나 상세한 설명을 적어주세요."
                  value={productDesc}
                  onChange={(e) => setProductDesc(e.target.value)}
                />
              </InputGroup>

              {/* 상품 옵션 입력란 */}
              <InputGroup>
                <Label>상품 옵션 (선택)</Label>
                <InputField 
                  type="text" 
                  placeholder="쉼표(,)로 구분해 옵션을 입력하세요 (예: M, L, XL)"
                  value={productOptions}
                  onChange={(e) => setProductOptions(e.target.value)}
                />
              </InputGroup>
            </InputCol>
          </FormGrid>

          {/* 등록 폼 제출 버튼 */}
          <SubmitButton type="submit">상품 등록하기</SubmitButton>
        </FormSection>

      </MainContent>
    </DashboardContainer>
  )
}

// =========================================================
// 공통 & 대시보드 레이아웃 Styled Components (C CSS-in-JS)
// =========================================================

// 컴포넌트 렌더링 로딩 중 화면
const LoadingScreen = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  font-size: 1.2rem;
  font-weight: 600;
  color: #4a5568;
  background-color: #f7fafc;
`

// 전체 화면의 좌/우 분리 뼈대가 되는 부모 박스
const DashboardContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: #edf2f7;
`

/* ----- 왼쪽 사이드바 (Navigation) 영역 ----- */
const Sidebar = styled.aside`
  width: 260px;
  background-color: #ffffff;
  border-right: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  padding: 2rem 1.5rem;
`

const SidebarLogo = styled.h1`
  font-size: 1.4rem;
  font-weight: 800;
  color: #2b6cb0;
  margin-bottom: 2.5rem;
  cursor: pointer;
`

const NavList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  flex: 1; /* 남은 높이를 다지해서 푸터를 하단에 밀어냅니다. */
`

// 각각의 네비게이션 탭 아이템
const NavItem = styled.li`
  padding: 0.8rem 1rem;
  margin-bottom: 0.5rem;
  border-radius: 8px;
  color: #4a5568;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: #ebf8ff;
    color: #2b6cb0;
  }

  /* 선택된 활성 탭일 때의 스타일 */
  &.active {
    background-color: #2b6cb0;
    color: #ffffff;
  }
`

const SidebarFooter = styled.div`
  margin-top: auto;
`

// 사이드바 최하단 로그아웃 버튼
const LogoutButton = styled.button`
  width: 100%;
  padding: 0.75rem;
  background-color: #f7fafc;
  color: #718096;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background-color: #e2e8f0;
    color: #2d3748;
  }
`

/* ----- 오른쪽 메인 콘텐츠 영역 ----- */
const MainContent = styled.main`
  flex: 1; /* 사이드바를 제외한 우측 남은 넓이를 모두 차지 */
  padding: 2.5rem 3rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
`

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const HeaderTitle = styled.h2`
  font-size: 1.8rem;
  font-weight: 800;
  color: #2d3748;
  margin: 0;
`

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 600;
  color: #4a5568;
`

// 헤더 우측 유저 아이콘
const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
`

// =========================================================
// 상품 관리폼 전용 커스텀 Styled Components
// =========================================================

// 상품 등록 입력칸들을 둥근 모서리로 감싸는 흰 바탕 부모 박스
const FormSection = styled.form`
  background-color: #ffffff;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
  display: flex;
  flex-direction: column;
  gap: 2rem;
`

// 폼 상단 회색 밑줄 달린 제목
const SectionTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0;
  border-bottom: 2px solid #edf2f7;
  padding-bottom: 0.8rem;
`

// 가로로 두 구역(좌: 사진 / 우: 입력칸)을 나누기 위해 그리드 사용
const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr; /* 비율을 절반씩 분배 */
  gap: 3rem;
  
  /* 화면이 태블릿 수준으로 작아지면 상하(1열)로 레이아웃 분리 전환 */
  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`

/* --- 왼쪽: 이미지 파일 업로드 박스 디자인 --- */
const ImageUploadArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

// 사진이 없으면 점선, 있으면 실선 등 조건별 스타일 렌더링 (hasImage prop활용)
const ImagePreviewBox = styled.div<{ $hasImage: boolean }>`
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1; /* 정사각형 가로세로 고정 비율 유지 */
  border: 2px dashed ${(props) => (props.$hasImage ? 'transparent' : '#cbd5e0')};
  border-radius: 12px;
  background-color: #f7fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden; /* 영역 밖으로 사진이 나가도 둥근 모서리에 잘리도록 */
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #a0aec0;
    background-color: #edf2f7;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover; /* 이미지가 박스에 꽉 차도록 자동 채움 */
  }
`

// 이미지가 없을 때 노출되는 카메라 아이콘과 안내 텍스트 부분
const EmptyImageBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: #a0aec0;
  font-weight: 500;
`

const UploadIcon = styled.span`
  font-size: 2.5rem;
`

// 실제 업로드 기능을 담당하는 file input (투명하게 만들어 위로 위치)
const ImageInput = styled.input`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0; /* 시야에서는 숨기지만 클릭 시 파일 탐색기가 열리도록 기능 유지 */
  cursor: pointer;
`

/* --- 오른쪽: 텍스트 입력칸들 디자인 구역 --- */
const InputCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`

// 각각의 라벨 텍스트와 실제 입력 Input 필드를 한 덩어리로 묶는 박스
const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`

const Label = styled.label`
  font-size: 0.95rem;
  font-weight: 600;
  color: #4a5568;
`

// 라벨 옆에 붙일 필수 표시(*) 디자인 (빨간색)
const Required = styled.span`
  color: #e53e3e;
`

// 문자열, 숫자를 받는 기본 인풋 텍스트 상자
const InputField = styled.input`
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  color: #1a202c;
  background-color: #ffffff;
  transition: all 0.2s;

  &:focus {
    /* 입력 클릭 시 테두리가 파란색으로 변하는 효과 */
    outline: none;
    border-color: #3182ce;
    box-shadow: 0 0 0 1px #3182ce;
  }
`

// 카테고리 등을 픽업하는 둥근 드롭다운 선택 화살표 박스
const SelectField = styled.select`
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  color: #1a202c;
  background-color: #ffffff;
  cursor: pointer;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #3182ce;
    box-shadow: 0 0 0 1px #3182ce;
  }
`

// 상품 상세를 입력할 수 있는 텍스트에어리어 공간
const TextAreaField = styled.textarea`
  width: 100%;
  height: 100%;
  min-height: 120px; /* 기본 높이 여유 */
  padding: 0.8rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  color: #1a202c;
  background-color: #ffffff;
  resize: vertical; /* 사용자가 사이즈를 자유롭게 위아래 조정만 가능토록 설정 */
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: #3182ce;
    box-shadow: 0 0 0 1px #3182ce;
  }
`

// 금액(숫자)와 우측의 '원' 텍스트를 나란히 묶는 구조 지원
const PriceInputWrapper = styled.div`
  display: flex;
  align-items: center;
  position: relative;
`

const PriceUnit = styled.span`
  /* 위치를 입력칸 우측 끝에 띄워둔 절대 배치 */
  position: absolute;
  right: 1rem;
  color: #4a5568;
  font-weight: 600;
`

// 상품 등록 버튼 전용
const SubmitButton = styled.button`
  align-self: flex-end; /* 가장 오른쪽 끝에 맞춤 */
  padding: 1rem 2.5rem;
  background-color: #2b6cb0;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: #2c5282;
    transform: translateY(-2px); /* 클릭 직전에 살짝 떠오르는 모션 */
    box-shadow: 0 4px 12px rgba(43, 108, 176, 0.2);
  }

  &:active {
    transform: translateY(0); /* 누를 때는 바닥에 착 붙도록 변경 */
  }
`

'use client'

import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  // 현재 선택된 카테고리를 추적하는 상태
  const [activeCategory, setActiveCategory] = useState(categories[0].name)
  
  // 로그인한 유저 정보를 담는 상태
  const [user, setUser] = useState<{ username: string; name?: string; role: string } | null>(null)
  
  // 카테고리별 상품 목록 상태
  const [products, setProducts] = useState<any[]>([])

  // 컴포넌트 마운트 시 로컬스토리지에서 로그인 정보 확인
  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      try {
        setUser(JSON.parse(userStr))
      } catch (e) {
        console.error('유저 정보 파싱 오류:', e)
      }
    }
  }, [])

  // 카테고리가 변경될 때마다 해당 카테고리의 상품 데이터를 불러옴
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`/api/products?category=${encodeURIComponent(activeCategory)}`)
        const data = await res.json()
        if (res.ok) {
          setProducts(data.products || [])
        }
      } catch (error) {
        console.error('상품 리스트 불러오기 실패:', error)
      }
    }
    fetchProducts()
  }, [activeCategory])

  // 로그아웃 처리
  const handleLogout = () => {
    localStorage.removeItem('user')
    setUser(null)
    alert('로그아웃 되었습니다.')
  }

  // 마이페이지 이동 처리 (판매자는 셀러 대시보드로, 일반은 마이페이지로)
  const handleMyPage = () => {
    if (user?.role === 'seller') {
      router.push('/seller')
    } else {
      alert('일반회원 마이페이지는 준비중입니다!') // 추후 구현
    }
  }

  return (
    <PageContainer>
      {/* 1. 글로벌 네비게이션 바 (GNB) */}
      <Navbar>
        <Logo onClick={() => router.push('/')}>Ojosama Shop</Logo>
        
        <NavActions>
          {user ? (
            <>
              {/* 로그인 성공 상태: 유저 이름과 마이페이지/로그아웃 버튼 표시 */}
              <WelcomeText><strong>{user.name || user.username}</strong>님 환영합니다!</WelcomeText>
              <LoginButton onClick={handleMyPage}>마이페이지</LoginButton>
              <SignupButton onClick={handleLogout}>로그아웃</SignupButton>
            </>
          ) : (
            <>
              {/* 비로그인 상태: 로그인/회원가입 노출 */}
              <LoginButton onClick={() => router.push('/auth?type=login')}>
                로그인
              </LoginButton>
              <SignupButton onClick={() => router.push('/auth?type=sign-up')}>
                회원가입
              </SignupButton>
            </>
          )}
        </NavActions>
      </Navbar>

      {/* 2. 상단 가로형 카테고리 메뉴바 (LNB) */}
      <CategoryMenuBar>
        <CategoryList>
          {categories.map((cat, idx) => (
            <React.Fragment key={cat.name}>
              <CategoryTab 
                $active={activeCategory === cat.name}
                onClick={() => setActiveCategory(cat.name)}
              >
                {cat.name}
              </CategoryTab>
              {/* 항목 사이에 구분자(|) 추가 (마지막 항목 제외) */}
              {idx < categories.length - 1 && <Divider>|</Divider>}
            </React.Fragment>
          ))}
        </CategoryList>
      </CategoryMenuBar>

      {/* 3. 메인 배너 및 선택된 카테고리별 콘텐츠 영역 */}
      <MainContent>
        <HeroSection>
          <HeroTitle>새로운 쇼핑의 시작</HeroTitle>
          <HeroSubtitle>최고의 상품을 만나보세요.</HeroSubtitle>
        </HeroSection>

        {/* 선택한 카테고리에 해당하는 메뉴/상품이 뜨는 하단 콘텐츠 영역 */}
        <ActiveCategorySection>
          <SectionTitle>
            <span style={{ color: '#3182ce' }}>{activeCategory}</span> 메뉴
          </SectionTitle>

          {products.length > 0 ? (
            <ProductGrid>
              {products.map(p => (
                <ProductCard key={p._id}>
                  {p.imageUrl ? (
                    <ProductImage src={p.imageUrl} alt={p.name} />
                  ) : (
                    <NoImage>이미지 없음</NoImage>
                  )}
                  <ProductInfo>
                    <ProductName>{p.name}</ProductName>
                    <ProductPrice>{p.price.toLocaleString()}원</ProductPrice>
                    <ProductCompany>상점명: {p.sellerCompany || 'Ojosama Seller'}</ProductCompany>
                  </ProductInfo>
                </ProductCard>
              ))}
            </ProductGrid>
          ) : (
            <ProductPlaceholder>
              <PlaceholderIcon>{categories.find(c => c.name === activeCategory)?.icon}</PlaceholderIcon>
              <PlaceholderText>
                현재 등록된 <strong>{activeCategory}</strong> 상품이 없습니다. <br/>
                새로운 상품을 등록해주세요!
              </PlaceholderText>
            </ProductPlaceholder>
          )}
        </ActiveCategorySection>

      </MainContent>
    </PageContainer>
  )
}

// --- 메뉴 카테고리 데이터 ---
const categories = [
  { name: '의류/패션', icon: '👕' },
  { name: '뷰티/화장품', icon: '💄' },
  { name: '전자기기', icon: '💻' },
  { name: '가전제품', icon: '📺' },
  { name: '식품/음료', icon: '🍔' },
  { name: '가구/인테리어', icon: '🛋️' },
  { name: '스포츠/레저', icon: '⚽' },
  { name: '도서/음반', icon: '📚' },
]

// --- Styled Components ---

const PageContainer = styled.div`
  min-height: 100vh;
  background-color: #f8fafc;
  display: flex;
  flex-direction: column;
`

const Navbar = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: #ffffff;
  /* 메뉴바와 구분을 위해 얇은 하단 테두리 선만 적용 */
  border-bottom: 1px solid #e2e8f0;
`

const Logo = styled.h1`
  font-size: 1.5rem;
  font-weight: 800;
  color: #1a202c;
  margin: 0;
  letter-spacing: -0.5px;
  cursor: pointer;
`

const NavActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
`

const WelcomeText = styled.span`
  font-size: 0.95rem;
  color: #4a5568;
  margin-right: 0.5rem;
  
  strong {
    color: #2b6cb0;
  }
`

const LoginButton = styled.button`
  padding: 0.5rem 1rem;
  background-color: transparent;
  color: #2b6cb0;
  border: 1px solid #2b6cb0;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: #ebf8ff;
  }
`

const SignupButton = styled.button`
  padding: 0.5rem 1rem;
  background-color: #2b6cb0;
  color: #ffffff;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: #2c5282;
  }
`

// 카테고리를 담는 상단 가로 메뉴바
const CategoryMenuBar = styled.nav`
  background-color: #ffffff;
  padding: 0.8rem 2rem;
  display: flex;
  justify-content: center;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); /* 아래로만 살짝 그림자 */
  position: sticky;
  top: 0;
  z-index: 999;
  overflow-x: auto; /* 너무 길면 가로 스크롤 가능하게 */
  white-space: nowrap;
`

const CategoryList = styled.div`
  display: flex;
  align-items: center;
  gap: 1.25rem;
`

// 카테고리 각각의 텍스트 탭
const CategoryTab = styled.span<{ $active: boolean }>`
  font-size: 1.05rem;
  font-weight: ${(props) => (props.$active ? '700' : '500')};
  color: ${(props) => (props.$active ? '#2b6cb0' : '#4a5568')};
  cursor: pointer;
  position: relative;
  transition: color 0.2s;

  &:hover {
    color: #2b6cb0;
  }

  /* 선택된 카테고리 하단에 파란색 밑줄 표시 */
  &::after {
    content: '';
    display: ${(props) => (props.$active ? 'block' : 'none')};
    position: absolute;
    bottom: -15px; /* 메뉴바 하단 라인 쯤에 위치하도록 조절 */
    left: 0;
    width: 100%;
    height: 3px;
    background-color: #2b6cb0;
    border-radius: 2px;
  }
`

const Divider = styled.span`
  color: #cbd5e0;
  font-size: 0.9rem;
  user-select: none;
`

const MainContent = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3rem 2rem;
`

const HeroSection = styled.section`
  text-align: center;
  margin-bottom: 3rem;
`

const HeroTitle = styled.h2`
  font-size: 2.5rem;
  font-weight: 800;
  color: #2d3748;
  margin-bottom: 0.5rem;
`

const HeroSubtitle = styled.p`
  font-size: 1.1rem;
  color: #718096;
`

const ActiveCategorySection = styled.section`
  width: 100%;
  max-width: 900px;
  background: white;
  border-radius: 12px;
  padding: 3rem 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  text-align: center;
`

const SectionTitle = styled.h3`
  font-size: 1.8rem;
  font-weight: 800;
  color: #2d3748;
  margin-bottom: 2rem;
`

const ProductPlaceholder = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  padding: 3rem 0;
  background-color: #f7fafc;
  border: 1px dashed #cbd5e0;
  border-radius: 12px;
`

const PlaceholderIcon = styled.div`
  font-size: 4rem;
`

const PlaceholderText = styled.p`
  font-size: 1.1rem;
  color: #4a5568;
  line-height: 1.6;

  strong {
    color: #2d3748;
  }
`

// 상품 리스트 그리드 박스
const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
`

// 개별 상품 카드 컨테이너
const ProductCard = styled.div`
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;

  &:hover {
    transform: translateY(-5px); /* 마우스 올렸을 때 살짝 위로 떠오르는 모션 */
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  }
`

// 상품의 썸네일 이미지
const ProductImage = styled.img`
  width: 100%;
  aspect-ratio: 1/1;        /* 가로 세로 1:1 비율 고정 */
  object-fit: cover;        /* 비율 깨지지 않게 꽉 채움 */
`

// 상품 썸네일 이미지가 없을 때의 대체 UI
const NoImage = styled.div`
  width: 100%;
  aspect-ratio: 1/1;
  background: #edf2f7;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #a0aec0;
  font-size: 0.95rem;
  font-weight: 500;
`

// 텍스트 정보들이 들어가는 영역
const ProductInfo = styled.div`
  padding: 1.25rem 1rem;
  text-align: left;
`

// 상품 제목 (길면 ... 으로 자름)
const ProductName = styled.div`
  font-size: 1.1rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 0.4rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

// 상품 가격
const ProductPrice = styled.div`
  font-size: 1.2rem;
  font-weight: 800;
  color: #e53e3e;
  margin-bottom: 0.5rem;
`

// 판매자 상점명
const ProductCompany = styled.div`
  font-size: 0.85rem;
  color: #718096;
`

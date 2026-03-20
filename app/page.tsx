'use client'

import React, { useState } from 'react'
import styled from 'styled-components'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  // 현재 선택된 카테고리를 추적하는 상태
  const [activeCategory, setActiveCategory] = useState(categories[0].name)

  return (
    <PageContainer>
      {/* 1. 글로벌 네비게이션 바 (GNB) */}
      <Navbar>
        <Logo>Ojosama Shop</Logo>
        
        <NavActions>
          <LoginButton onClick={() => router.push('/auth?type=login')}>
            로그인
          </LoginButton>
          <SignupButton onClick={() => router.push('/auth?type=sign-up')}>
            회원가입
          </SignupButton>
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
          <ProductPlaceholder>
            <PlaceholderIcon>{categories.find(c => c.name === activeCategory)?.icon}</PlaceholderIcon>
            <PlaceholderText>
              이곳에 <strong>{activeCategory}</strong>와 관련된 <br/>
              하위 메뉴와 상품 리스트가 표시됩니다.
            </PlaceholderText>
          </ProductPlaceholder>
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

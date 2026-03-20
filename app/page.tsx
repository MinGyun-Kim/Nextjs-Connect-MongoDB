'use client'

import styled from 'styled-components'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  return (
    <PageContainer>
      {/* 글로벌 네비게이션 바 (GNB) */}
      <Navbar>
        <Logo>Ojosama Shop</Logo>
        
        <NavActions>
          {/* 로그인 / 회원가입 버튼 */}
          <AuthButton onClick={() => router.push('/auth?type=login')}>
            로그인 / 회원가입
          </AuthButton>
        </NavActions>
      </Navbar>

      {/* 메인 콘텐츠 영역 (추후 기능 추가 예정) */}
      <MainContent>
        <HeroSection>
          <HeroTitle>환영합니다!</HeroTitle>
          <HeroSubtitle>최고의 상품을 만나보세요.</HeroSubtitle>
        </HeroSection>
      </MainContent>
    </PageContainer>
  )
}

// --- Styled Components ---

const PageContainer = styled.div`
  min-height: 100vh;
  background-color: #f8fafc;
  display: flex;
  flex-direction: column;
`

// 헤더(네비게이션 바) 영역
const Navbar = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: #ffffff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05); /* 부드러운 그림자로 깊이감 부여 */
  position: sticky;
  top: 0;
  z-index: 1000;
`

// 로고 텍스트 (추후 로고 이미지로 대체 가능)
const Logo = styled.h1`
  font-size: 1.5rem;
  font-weight: 800;
  color: #1a202c;
  margin: 0;
  letter-spacing: -0.5px;
  cursor: pointer;
`

// 네비게이션 액션 영역 (우측 버튼 등)
const NavActions = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`

// 로그인 / 회원가입 버튼
const AuthButton = styled.button`
  padding: 0.6rem 1.25rem;
  background-color: #2b6cb0;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: #2c5282;
    transform: translateY(-1px); /* 살짝 위로 뜨는 효과 */
    box-shadow: 0 4px 12px rgba(43, 108, 176, 0.2);
  }

  &:active {
    transform: translateY(0);
  }
`

// 메인 콘텐츠 컨테이너
const MainContent = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
`

// 첫 화면 배너 영역
const HeroSection = styled.section`
  text-align: center;
  animation: fadeIn 0.5s ease-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`

const HeroTitle = styled.h2`
  font-size: 3rem;
  font-weight: 800;
  color: #2d3748;
  margin-bottom: 1rem;
`

const HeroSubtitle = styled.p`
  font-size: 1.25rem;
  color: #718096;
`

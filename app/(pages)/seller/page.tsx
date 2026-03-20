'use client'

import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { useRouter } from 'next/navigation'

export default function SellerDashboard() {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)

  // 판매자로 로그인 되어있는지 검증
  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      try {
        const user = JSON.parse(userStr)
        if (user.role === 'seller') {
          setIsAuthorized(true)
          return
        }
      } catch (e) { console.error(e) }
    }
    setIsAuthorized(false)
    alert('판매자 권한이 필요합니다.')
    router.push('/auth?type=login')
  }, [router])

  // 권한 확인 중엔 깜빡임 없이 로딩 스크린 표시
  if (isAuthorized === null || isAuthorized === false) {
    return <LoadingScreen>권한 확인 중...</LoadingScreen>
  }

  return (
    <DashboardContainer>
      {/* 1. 사이드바 네비게이션 */}
      <Sidebar>
        <SidebarLogo onClick={() => router.push('/')}>Ojosama Seller</SidebarLogo>
        <NavList>
          {/* 현재 대시보드(셀러 홈)이므로 강조 */}
          <NavItem className="active" onClick={() => router.push('/seller')}>대시보드</NavItem>
          <NavItem onClick={() => router.push('/seller/products')}>상품 관리</NavItem>
          <NavItem onClick={() => router.push('/seller/orders')}>주문 배송 관리</NavItem>
          <NavItem onClick={() => alert('매출 통계 기능 준비중')}>매출 통계</NavItem>
          <NavItem onClick={() => alert('상점 설정 기능 준비중')}>상점 설정</NavItem>
        </NavList>
        <SidebarFooter>
          <LogoutButton onClick={() => { localStorage.removeItem('user'); router.push('/auth?type=login') }}>
            로그아웃
          </LogoutButton>
        </SidebarFooter>
      </Sidebar>

      {/* 2. 대시보드 메인 콘텐츠 영역 */}
      <MainContent>
        <Header>
          <HeaderTitle>판매자 대시보드</HeaderTitle>
          <UserInfo>
            <Avatar>👨‍💼</Avatar>
            <span>판매자님 환영합니다</span>
          </UserInfo>
        </Header>
        <ContentArea>
          <WelcomeCard>
            <h3>새로운 판매를 시작해 보세요! 🚀</h3>
            <p>좌측 "상품 관리" 메뉴를 클릭해 새로운 상품을 썸네일과 함께 등록하시고 메인 홈 화면에 노출시켜 보세요.</p>
            <RegisterButton onClick={() => router.push('/seller/products')}>
              상품 바로 등록하러 가기 &rarr;
            </RegisterButton>
          </WelcomeCard>
        </ContentArea>
      </MainContent>
    </DashboardContainer>
  )
}

// ---------------- Styled Components ----------------
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

const DashboardContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: #edf2f7;
`

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
  flex: 1;
`

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

  &.active {
    background-color: #2b6cb0;
    color: #ffffff;
  }
`

const SidebarFooter = styled.div`
  margin-top: auto;
`

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

const MainContent = styled.main`
  flex: 1;
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

const ContentArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`

const WelcomeCard = styled.div`
  background: #ffffff;
  padding: 2.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);

  h3 {
    margin: 0 0 1rem 0;
    color: #2d3748;
    font-size: 1.5rem;
  }
  
  p {
    color: #4a5568;
    margin-bottom: 2rem;
    font-size: 1.1rem;
    line-height: 1.6;
  }
`

const RegisterButton = styled.button`
  padding: 0.8rem 1.5rem;
  background-color: #2b6cb0;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: #2c5282;
  }
`

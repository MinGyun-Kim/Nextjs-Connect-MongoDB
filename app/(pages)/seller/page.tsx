'use client'

import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { useRouter } from 'next/navigation'

export default function SellerDashboard() {
  const router = useRouter()
  // null = 로딩(판단 전), true = 인가됨, false = 권한 없음
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)

  useEffect(() => {
    /**
     * [권한 체크 로직]
     * 실제로는 Next.js 미들웨어나 Context API, 혹은 쿠키/JWT 토큰을 검증해야 합니다.
     * 현재는 로컬 스토리지에 저장된 유저 정보를 통해 'seller' 인지 판단하는 예시입니다.
     */
    const checkAuth = () => {
      const userStr = localStorage.getItem('user')
      if (userStr) {
        try {
          const user = JSON.parse(userStr)
          if (user.role === 'seller') {
            setIsAuthorized(true) // 판매자 권한 확인 성공
            return
          }
        } catch (e) {
          console.error('유저 권한 파싱 오류:', e)
        }
      }
      
      // 권한이 없는 경우(로그인 안 했거나 일반 회원인 경우)
      setIsAuthorized(false)
      alert('판매자 권한이 필요합니다. 판매자 계정으로 로그인해주세요.')
      router.push('/auth?type=login')
    }

    checkAuth()
  }, [router])

  // 권한을 확인하는 동안에는 빈 화면(혹은 로딩 화면)을 보여주어 권한 없는 콘텐츠 깜빡임을 방지합니다.
  if (isAuthorized === null || isAuthorized === false) {
    return <LoadingScreen>권한 확인 중...</LoadingScreen>
  }

  // --- 판매자용 메인화면 렌더링 ---
  return (
    <DashboardContainer>
      {/* 왼쪽 사이드바 메뉴 */}
      <Sidebar>
        <SidebarLogo onClick={() => router.push('/')}>Ojosama Seller</SidebarLogo>
        <NavList>
          <NavItem className="active" onClick={() => router.push('/seller')}>대시보드</NavItem>
          <NavItem onClick={() => router.push('/seller/products')}>상품 관리</NavItem>
          <NavItem>주문 배송 관리</NavItem>
          <NavItem>매출 통계</NavItem>
          <NavItem>상점 설정</NavItem>
        </NavList>
        <SidebarFooter>
          {/* 테스트용 임시 로그아웃 기능 (추후 실제 상태관리 연동 필요) */}
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

      {/* 오른쪽 메인 콘텐츠 영역 */}
      <MainContent>
        <Header>
          <HeaderTitle>대시보드</HeaderTitle>
          <UserInfo>
            <Avatar>👨‍💼</Avatar>
            <span>판매자님 환영합니다</span>
          </UserInfo>
        </Header>

        {/* 핵심 통계 요약 카드 영역 */}
        <StatGrid>
          <StatCard>
            <StatLabel>오늘의 매출</StatLabel>
            <StatValue style={{ color: '#2b6cb0' }}>0 원</StatValue>
            <StatDesc>어제 대비 0% 상승</StatDesc>
          </StatCard>
          <StatCard>
            <StatLabel>신규 결제/주문</StatLabel>
            <StatValue>0 건</StatValue>
            <StatDesc>배송 준비 중 0건</StatDesc>
          </StatCard>
          <StatCard>
            <StatLabel>판매 중인 상품</StatLabel>
            <StatValue>0 개</StatValue>
            <StatDesc>품절 상품 0개</StatDesc>
          </StatCard>
          <StatCard>
            <StatLabel>구매자 문의</StatLabel>
            <StatValue style={{ color: '#c53030' }}>0 건</StatValue>
            <StatDesc>미답변 문의 0건</StatDesc>
          </StatCard>
        </StatGrid>

        {/* 최근 주문 내역 (임시 테이블) */}
        <RecentOrdersSection>
          <SectionTitle>최근 들어온 주문</SectionTitle>
          <OrdersTable>
            <thead>
              <tr>
                <th>주문번호</th>
                <th>상품명</th>
                <th>주문자</th>
                <th>결제금액</th>
                <th>상태</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '3rem 0', color: '#a0aec0' }}>
                  아직 들어온 신규 주문이 없습니다.
                </td>
              </tr>
            </tbody>
          </OrdersTable>
        </RecentOrdersSection>
      </MainContent>
    </DashboardContainer>
  )
}

// --- Styled Components ---

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

/* ---------- 사이드바 영역 ---------- */
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

/* ---------- 메인 콘텐츠 영역 ---------- */
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

/* ---------- 통계 그리드 영역 ---------- */
const StatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
`

const StatCard = styled.div`
  background-color: #ffffff;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

const StatLabel = styled.h4`
  font-size: 0.95rem;
  color: #718096;
  margin: 0;
`

const StatValue = styled.p`
  font-size: 1.8rem;
  font-weight: 800;
  color: #2d3748;
  margin: 0;
`

const StatDesc = styled.span`
  font-size: 0.85rem;
  color: #a0aec0;
`

/* ---------- 최근 주문 표 영역 ---------- */
const RecentOrdersSection = styled.section`
  background-color: #ffffff;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
  flex: 1; /* 바닥까지 꽉 채우도록 설정 */
`

const SectionTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 1.5rem;
`

const OrdersTable = styled.table`
  width: 100%;
  border-collapse: collapse;

  th,
  td {
    padding: 1rem;
    text-align: left;
    border-bottom: 1px solid #edf2f7;
  }

  th {
    background-color: #f7fafc;
    color: #4a5568;
    font-size: 0.9rem;
    font-weight: 600;
  }

  td {
    color: #2d3748;
    font-size: 0.95rem;
  }
`

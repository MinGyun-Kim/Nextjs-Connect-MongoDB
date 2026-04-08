'use client'

import React, { useState, useEffect, useCallback } from 'react'
import styled from 'styled-components'
import { useRouter } from 'next/navigation'

// ─────────────────────────────────────────────
// 타입 정의
// ─────────────────────────────────────────────
type Period = 'day' | 'month' | 'year'

interface ChartItem {
  label: string
  amount: number
}

interface ProductRank {
  productId: string
  name: string
  quantity: number
  revenue: number
}

interface Summary {
  totalRevenue: number
  totalOrders: number
  avgOrderAmount: number
}

export default function SellerStatsPage() {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)
  const [sellerId, setSellerId] = useState('')

  // 현재 선택된 기간 탭 (day/month/year)
  const [period, setPeriod] = useState<Period>('month')

  // API에서 받아온 데이터
  const [chartData, setChartData] = useState<ChartItem[]>([])
  const [productRanking, setProductRanking] = useState<ProductRank[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // ─────────────────────────────────────────────
  // 통계 데이터 불러오기
  // ─────────────────────────────────────────────
  const fetchStats = useCallback(async (id: string, p: Period) => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/seller/stats?sellerId=${id}&period=${p}`)
      const data = await res.json()
      if (res.ok) {
        setChartData(data.chartData || [])
        setProductRanking(data.productRanking || [])
        setSummary(data.summary || null)
      }
    } catch (err) {
      console.error('Stats fetch error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // ─────────────────────────────────────────────
  // 판매자 권한 확인
  // ─────────────────────────────────────────────
  useEffect(() => {
    const userStr = sessionStorage.getItem('user')
    if (userStr) {
      try {
        const user = JSON.parse(userStr)
        if (user.role === 'seller') {
          setIsAuthorized(true)
          setSellerId(user.username)
          fetchStats(user.username, 'month') // 마운트 시 월별 통계 기본 로드
          return
        }
      } catch (e) {
        console.error(e)
      }
    }
    setIsAuthorized(false)
    alert('판매자 권한이 필요합니다.')
    router.push('/auth?type=login')
  }, [router, fetchStats])

  // 탭 전환 시 데이터 재조회
  const handlePeriodChange = (p: Period) => {
    setPeriod(p)
    if (sellerId) fetchStats(sellerId, p)
  }

  if (isAuthorized === null || isAuthorized === false) {
    return <LoadingScreen>권한 확인 중...</LoadingScreen>
  }

  // 차트 최대값 (막대그래프 높이 비율 계산용)
  const maxAmount = Math.max(...chartData.map((d) => d.amount), 1)

  // 메달 이모지
  const medals = ['🥇', '🥈', '🥉']

  return (
    <DashboardContainer>
      {/* ── 사이드바 ── */}
      <Sidebar>
        <SidebarLogo onClick={() => router.push('/')}>Ojosama Seller</SidebarLogo>
        <NavList>
          <NavItem onClick={() => router.push('/seller')}>대시보드</NavItem>
          <NavItem onClick={() => router.push('/seller/products')}>상품 관리</NavItem>
          <NavItem onClick={() => router.push('/seller/orders')}>주문 배송 관리</NavItem>
          <NavItem className="active" onClick={() => router.push('/seller/stats')}>매출 통계</NavItem>
        </NavList>
        <SidebarFooter>
          <LogoutButton onClick={() => { sessionStorage.removeItem('user'); router.push('/auth?type=login') }}>
            로그아웃
          </LogoutButton>
        </SidebarFooter>
      </Sidebar>

      {/* ── 메인 콘텐츠 ── */}
      <MainContent>
        {/* 헤더 */}
        <Header>
          <HeaderTitle>📊 매출 통계</HeaderTitle>
          <UserInfo>
            <Avatar>👨‍💼</Avatar>
            <span>판매자님 환영합니다</span>
          </UserInfo>
        </Header>

        <ContentArea>
          {/* ── 요약 카드 3개 ── */}
          {summary && (
            <SummaryRow>
              <SummaryCard $color="#2b6cb0">
                <SummaryLeft>
                  <SummaryIcon>💰</SummaryIcon>
                  <SummaryLabel>총 매출액</SummaryLabel>
                </SummaryLeft>
                <SummaryValue>{summary.totalRevenue.toLocaleString()}원</SummaryValue>
              </SummaryCard>
              <SummaryCard $color="#38a169">
                <SummaryLeft>
                  <SummaryIcon>📦</SummaryIcon>
                  <SummaryLabel>총 주문 수</SummaryLabel>
                </SummaryLeft>
                <SummaryValue>{summary.totalOrders.toLocaleString()}건</SummaryValue>
              </SummaryCard>
              <SummaryCard $color="#d69e2e">
                <SummaryLeft>
                  <SummaryIcon>🧾</SummaryIcon>
                  <SummaryLabel>평균 주문금액</SummaryLabel>
                </SummaryLeft>
                <SummaryValue>{summary.avgOrderAmount.toLocaleString()}원</SummaryValue>
              </SummaryCard>
            </SummaryRow>
          )}

          {/* ── 기간별 매출 차트 ── */}
          <ChartCard>
            <ChartHeader>
              <ChartTitle>기간별 매출 현황</ChartTitle>
              {/* 기간 탭 버튼 */}
              <TabGroup>
                <TabButton $active={period === 'day'} onClick={() => handlePeriodChange('day')}>일별 (10일)</TabButton>
                <TabButton $active={period === 'month'} onClick={() => handlePeriodChange('month')}>월별 (12개월)</TabButton>
                <TabButton $active={period === 'year'} onClick={() => handlePeriodChange('year')}>연별 (5년)</TabButton>
              </TabGroup>
            </ChartHeader>

            {isLoading ? (
              <LoadingText>데이터를 불러오는 중입니다...</LoadingText>
            ) : (
              <>
                {/* 막대그래프 영역 */}
                <BarChart>
                  {chartData.map((item, idx) => (
                    <BarColumn key={idx}>
                      <BarTooltip>{item.amount.toLocaleString()}원</BarTooltip>
                      <Bar
                        $height={item.amount > 0 ? Math.max((item.amount / maxAmount) * 100, 4) : 0}
                        $hasValue={item.amount > 0}
                      />
                      <BarLabel>{item.label}</BarLabel>
                    </BarColumn>
                  ))}
                </BarChart>

                {/* 해당 기간 내 매출이 없을 때 안내 */}
                {chartData.every((d) => d.amount === 0) && (
                  <EmptyChartMsg>아직 해당 기간에 매출 데이터가 없습니다.</EmptyChartMsg>
                )}
              </>
            )}
          </ChartCard>

          {/* ── 상품 판매 순위 ── */}
          <RankCard>
            <ChartTitle>🏆 상품 판매 순위 (전체 기간 기준)</ChartTitle>
            {isLoading ? (
              <LoadingText>데이터를 불러오는 중입니다...</LoadingText>
            ) : productRanking.length === 0 ? (
              <EmptyChartMsg>판매된 상품이 없습니다.</EmptyChartMsg>
            ) : (
              <RankTable>
                <thead>
                  <tr>
                    <th>순위</th>
                    <th>상품명</th>
                    <th>판매 수량</th>
                    <th>판매 매출</th>
                  </tr>
                </thead>
                <tbody>
                  {productRanking.map((item, idx) => (
                    <tr key={item.productId}>
                      <td className="rank">
                        {idx < 3 ? medals[idx] : `${idx + 1}위`}
                      </td>
                      <td className="name">{item.name}</td>
                      <td className="qty">
                        <QtyBar>
                          <QtyFill $width={(item.quantity / productRanking[0].quantity) * 100} />
                          <QtyText>{item.quantity.toLocaleString()}개</QtyText>
                        </QtyBar>
                      </td>
                      <td className="revenue">{item.revenue.toLocaleString()}원</td>
                    </tr>
                  ))}
                </tbody>
              </RankTable>
            )}
          </RankCard>
        </ContentArea>
      </MainContent>
    </DashboardContainer>
  )
}

// ══════════════════════════════════════════════
// Styled Components
// ══════════════════════════════════════════════
const LoadingScreen = styled.div`
  display: flex; align-items: center; justify-content: center;
  height: 100vh; font-size: 1.2rem; font-weight: 600;
  color: #4a5568; background-color: #f7fafc;
`
const DashboardContainer = styled.div`
  display: flex; min-height: 100vh; background-color: #edf2f7;
`
/* ── 사이드바 ── */
const Sidebar = styled.aside`
  width: 260px; background-color: #ffffff; border-right: 1px solid #e2e8f0;
  display: flex; flex-direction: column; padding: 2rem 1.5rem;
`
const SidebarLogo = styled.h1`
  font-size: 1.4rem; font-weight: 800; color: #2b6cb0;
  margin-bottom: 2.5rem; cursor: pointer;
`
const NavList = styled.ul`
  list-style: none; padding: 0; margin: 0; flex: 1;
`
const NavItem = styled.li`
  padding: 0.8rem 1rem; margin-bottom: 0.5rem; border-radius: 8px;
  color: #4a5568; font-weight: 600; cursor: pointer; transition: all 0.2s ease;
  &:hover { background-color: #ebf8ff; color: #2b6cb0; }
  &.active { background-color: #2b6cb0; color: #ffffff; }
`
const SidebarFooter = styled.div` margin-top: auto; `
const LogoutButton = styled.button`
  width: 100%; padding: 0.75rem; background-color: #f7fafc; color: #718096;
  border: 1px solid #e2e8f0; border-radius: 8px; font-weight: 600; cursor: pointer;
  &:hover { background-color: #e2e8f0; color: #2d3748; }
`
/* ── 메인 ── */
const MainContent = styled.main`
  flex: 1; padding: 2.5rem 3rem;
  display: flex; flex-direction: column; gap: 2rem;
`
const Header = styled.header`
  display: flex; justify-content: space-between; align-items: center;
`
const HeaderTitle = styled.h2`
  font-size: 1.8rem; font-weight: 800; color: #2d3748; margin: 0;
`
const UserInfo = styled.div`
  display: flex; align-items: center; gap: 0.75rem; font-weight: 600; color: #4a5568;
`
const Avatar = styled.div`
  width: 40px; height: 40px; border-radius: 50%; background-color: #e2e8f0;
  display: flex; align-items: center; justify-content: center; font-size: 1.2rem;
`
const ContentArea = styled.div`
  display: flex; flex-direction: column; gap: 1.5rem;
`
/* ── 요약 카드 ── */
const SummaryRow = styled.div`
  display: flex; flex-direction: column; gap: 0.8rem;
`
const SummaryCard = styled.div<{ $color: string }>`
  background: #ffffff; border-radius: 12px; padding: 1.2rem 1.8rem;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
  border-left: 5px solid ${({ $color }) => $color};
  display: flex; align-items: center; justify-content: space-between;
`
const SummaryLeft = styled.div`
  display: flex; align-items: center; gap: 0.75rem;
`
const SummaryIcon = styled.span` font-size: 1.4rem; `
const SummaryLabel = styled.p`
  margin: 0; font-size: 1rem; color: #4a5568; font-weight: 700;
`
const SummaryValue = styled.p`
  margin: 0; font-size: 1.4rem; font-weight: 800; color: #2d3748;
`
/* ── 차트 카드 ── */
const ChartCard = styled.div`
  background: #ffffff; border-radius: 12px; padding: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
`
const ChartHeader = styled.div`
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;
`
const ChartTitle = styled.h3`
  margin: 0 0 1.5rem 0; font-size: 1.1rem; font-weight: 800; color: #2d3748;
`
const TabGroup = styled.div`
  display: flex; gap: 0.5rem;
`
const TabButton = styled.button<{ $active: boolean }>`
  padding: 0.5rem 1rem; border-radius: 20px; font-size: 0.85rem; font-weight: 700;
  cursor: pointer; transition: all 0.2s;
  border: 2px solid ${({ $active }) => ($active ? '#2b6cb0' : '#e2e8f0')};
  background: ${({ $active }) => ($active ? '#2b6cb0' : '#ffffff')};
  color: ${({ $active }) => ($active ? '#ffffff' : '#718096')};
  &:hover { border-color: #2b6cb0; color: ${({ $active }) => ($active ? '#ffffff' : '#2b6cb0')}; }
`
const BarChart = styled.div`
  display: flex; align-items: flex-end; gap: 4px;
  height: 320px; padding: 0 0.5rem;
  overflow-x: auto;
`
const BarColumn = styled.div`
  display: flex; flex-direction: column; align-items: center;
  flex: 1; min-width: 28px; position: relative;
  &:hover > div:first-child { opacity: 1; }
`
const BarTooltip = styled.div`
  position: absolute; bottom: calc(100% + 4px);
  background: #2d3748; color: #fff; font-size: 0.7rem; font-weight: 700;
  padding: 3px 6px; border-radius: 4px; white-space: nowrap;
  opacity: 0; transition: opacity 0.15s; pointer-events: none; z-index: 10;
`
const Bar = styled.div<{ $height: number; $hasValue: boolean }>`
  width: 100%; height: ${({ $height }) => $height}%;
  background: ${({ $hasValue }) =>
    $hasValue
      ? 'linear-gradient(to top, #2b6cb0, #63b3ed)'
      : '#edf2f7'};
  border-radius: 4px 4px 0 0;
  transition: height 0.4s ease;
  min-height: 4px;
`
const BarLabel = styled.span`
  font-size: 0.65rem; color: #718096; margin-top: 4px;
  text-align: center; transform: rotate(-45deg);
  display: inline-block; white-space: nowrap;
`
const EmptyChartMsg = styled.p`
  text-align: center; color: #a0aec0; font-size: 0.95rem; padding: 2rem 0;
`
const LoadingText = styled.p`
  text-align: center; color: #718096; padding: 2rem 0;
`
/* ── 상품 순위 ── */
const RankCard = styled.div`
  background: #ffffff; border-radius: 12px; padding: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
`
const RankTable = styled.table`
  width: 100%; border-collapse: collapse; margin-top: 0.5rem;

  th {
    background-color: #f7fafc; padding: 0.9rem 1rem;
    text-align: left; font-weight: 700; color: #4a5568;
    border-bottom: 2px solid #e2e8f0; font-size: 0.9rem;
  }
  td {
    padding: 0.9rem 1rem; border-bottom: 1px solid #edf2f7;
    color: #2d3748; font-size: 0.95rem; vertical-align: middle;
  }
  tr:last-child td { border-bottom: none; }
  tr:hover td { background-color: #f7fafc; }

  .rank { font-size: 1.1rem; font-weight: 800; width: 70px; }
  .name { font-weight: 600; }
  .qty { width: 220px; }
  .revenue { font-weight: 800; color: #e53e3e; text-align: right; }
`
const QtyBar = styled.div`
  display: flex; align-items: center; gap: 0.6rem;
`
const QtyFill = styled.div<{ $width: number }>`
  height: 10px; width: ${({ $width }) => $width}%;
  max-width: 120px; min-width: 4px;
  background: linear-gradient(to right, #2b6cb0, #63b3ed);
  border-radius: 5px; transition: width 0.4s ease;
`
const QtyText = styled.span`
  font-size: 0.85rem; font-weight: 700; color: #4a5568; white-space: nowrap;
`

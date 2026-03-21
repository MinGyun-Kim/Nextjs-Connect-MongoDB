'use client'

import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { useRouter } from 'next/navigation'

export default function SellerOrderManagement() {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)
  
  const [orders, setOrders] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // 1. 판매자 권한 확인
  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      try {
        const user = JSON.parse(userStr)
        if (user.role === 'seller') {
          setIsAuthorized(true)
          fetchSellerOrders(user.username) // 조회
          return
        }
      } catch (e) {
        console.error(e)
      }
    }
    setIsAuthorized(false)
    alert('판매자 권한이 필요합니다.')
    router.push('/auth?type=login')
  }, [router])

  // 2. 판매자 주문 데이터 불러오기 (GET api/orders?sellerId=...)
  const fetchSellerOrders = async (sellerId: string) => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/orders?sellerId=${sellerId}`)
      const data = await res.json()
      if (res.ok) {
        setOrders(data.orders || [])
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  // 3. 주문 배송 상태 변경하기 (PUT api/orders)
  const handleStatusChange = async (orderId: string, currentStatus: string, newStatus: string) => {
    if (currentStatus === newStatus) return
    
    // 무통장 입금(입금 대기중) -> 결제 완료 승인 처리 시 경고
    if (currentStatus === '입금 대기중' && newStatus !== '결제 완료') {
      return alert('입금 대기중인 건은 먼저 [결제 완료] 처리부터 하셔야 합니다!')
    }

    if (!confirm(`배송 상태를 [${newStatus}] 로 변경하시겠습니까?`)) return

    try {
      const res = await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, newStatus })
      })
      
      if (res.ok) {
        // 성공 시 화면 최신화
        setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o))
        alert('상태가 정상적으로 반영되었습니다.')
      } else {
        const data = await res.json()
        alert(data.message || '상태 변경 중 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error(error)
      alert('서버 네트워크 오류가 발생했습니다.')
    }
  }

  if (isAuthorized === null || isAuthorized === false) return <LoadingScreen>권한 확인 중...</LoadingScreen>

  return (
    <DashboardContainer>
      {/* 1. 왼쪽 사이드바 */}
      <Sidebar>
        <SidebarLogo onClick={() => router.push('/')}>Ojosama Seller</SidebarLogo>
        <NavList>
          <NavItem onClick={() => router.push('/seller')}>대시보드</NavItem>
          <NavItem onClick={() => router.push('/seller/products')}>상품 관리</NavItem>
          <NavItem className="active" onClick={() => router.push('/seller/orders')}>주문 배송 관리</NavItem>
          <NavItem onClick={() => router.push('/seller/stats')}>매출 통계</NavItem>
        </NavList>
        <SidebarFooter>
          <LogoutButton onClick={() => { localStorage.removeItem('user'); router.push('/auth?type=login') }}>
            로그아웃
          </LogoutButton>
        </SidebarFooter>
      </Sidebar>

      {/* 2. 메인 콘텐츠 영역 (주문 내역 테이블) */}
      <MainContent>
        <Header>
          <HeaderTitle>고객 주문내역 처리 및 배송 관리</HeaderTitle>
          <UserInfo>
            <Avatar>👨‍💼</Avatar>
            <span>판매자님 환영합니다</span>
          </UserInfo>
        </Header>

        <ContentArea>
          {isLoading ? (
            <p style={{ color: '#718096' }}>들어온 주문 건을 조회하는 중입니다...</p>
          ) : orders.length === 0 ? (
            <EmptyCard>아직 판매자님 상품에 대한 주문 건이 없습니다.</EmptyCard>
          ) : (
            <OrderTableBox>
              <OrderTable>
                <thead>
                  <tr>
                    <th>주문 일시</th>
                    <th>주문자(받는분)</th>
                    <th>배송지</th>
                    <th>상품 및 수량</th>
                    <th>총 결제액 (수단)</th>
                    <th>배송 현황 처리</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order._id}>
                      <td className="date">{new Date(order.createdAt).toLocaleString()}</td>
                      <td><b>{order.buyerName}</b><br/><span style={{fontSize: '0.85rem', color: '#718096'}}>{order.buyerId}</span></td>
                      <td className="address">
                        <p>{order.roadAddress}</p>
                        <p className="detail">{order.detailAddress}</p>
                      </td>
                      <td className="items">
                        {order.items.map((it:any, idx:number) => (
                          <div key={idx}>- {it.name} ({it.quantity}개)</div>
                        ))}
                      </td>
                      <td className="amount">
                        <span className="price">{order.totalAmount.toLocaleString()}원</span>
                        <br/>({order.paymentMethod})
                      </td>
                      <td className="action">
                        {/* 상태 변경 드롭다운 UI */}
                        <StatusSelect 
                          value={order.status}
                          $status={order.status}
                          onChange={(e) => handleStatusChange(order._id, order.status, e.target.value)}
                        >
                          <option value="입금 대기중">입금 대기중</option>
                          <option value="결제 완료">결제 완료 (입금확인)</option>
                          <option value="배송 준비중">배송 준비중</option>
                          <option value="배송 중">🚀 택배 발송 (배송중)</option>
                          <option value="배송 완료">✅ 배송 완료</option>
                        </StatusSelect>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </OrderTable>
            </OrderTableBox>
          )}
        </ContentArea>
      </MainContent>
    </DashboardContainer>
  )
}

// ---------------- Styled Components ----------------
const LoadingScreen = styled.div`
  display: flex; align-items: center; justify-content: center; height: 100vh;
  font-size: 1.2rem; font-weight: 600; color: #4a5568; background-color: #f7fafc;
`
const DashboardContainer = styled.div`
  display: flex; min-height: 100vh; background-color: #edf2f7;
`
/* 사이드바 */
const Sidebar = styled.aside`
  width: 260px; background-color: #ffffff; border-right: 1px solid #e2e8f0;
  display: flex; flex-direction: column; padding: 2rem 1.5rem;
`
const SidebarLogo = styled.h1`
  font-size: 1.4rem; font-weight: 800; color: #2b6cb0; margin-bottom: 2.5rem; cursor: pointer;
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

/* 메인 영역 */
const MainContent = styled.main`
  flex: 1; padding: 2.5rem 3rem; display: flex; flex-direction: column; gap: 2rem;
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
const EmptyCard = styled.div`
  background: #ffffff; padding: 3rem; border-radius: 12px; text-align: center;
  font-size: 1.1rem; color: #718096; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
`

/* 주문 관리 전용 테이블 스타일 */
const OrderTableBox = styled.div`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
  border: 1px solid #e2e8f0;
`
const OrderTable = styled.table`
  width: 100%;
  border-collapse: collapse;

  th {
    background-color: #f7fafc;
    padding: 1.2rem 1rem;
    text-align: left;
    font-weight: 700;
    color: #4a5568;
    border-bottom: 2px solid #e2e8f0;
  }

  td {
    padding: 1.2rem 1rem;
    border-bottom: 1px solid #edf2f7;
    color: #2d3748;
    font-size: 0.95rem;
    vertical-align: middle;
  }

  tr:last-child td {
    border-bottom: none;
  }

  .date { font-size: 0.85rem; color: #718096; }
  .address p { margin: 0; }
  .address .detail { font-size: 0.85rem; color: #718096; }
  .items { font-size: 0.9rem; font-weight: 600; line-height: 1.6; }
  .amount { 
    font-size: 0.85rem; color: #718096; 
    .price { font-size: 1.1rem; font-weight: 800; color: #e53e3e; }
  }
`

const StatusSelect = styled.select<{ $status: string }>`
  padding: 0.6rem;
  border-radius: 6px;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  border: 1px solid #cbd5e0;
  outline: none;
  transition: all 0.2s;

  ${({ $status }) => {
    if ($status === '입금 대기중') return 'background-color: #fefcbf; color: #975a16; border-color: #d69e2e;'
    if ($status === '결제 완료') return 'background-color: #ebf8ff; color: #2b6cb0; border-color: #63b3ed;'
    if ($status === '배송 준비중') return 'background-color: #e9d8fd; color: #553c9a; border-color: #b794f4;'
    if ($status === '배송 중') return 'background-color: #c6f6d5; color: #22543d; border-color: #68d391;'
    if ($status === '배송 완료') return 'background-color: #fed7d7; color: #822727; border-color: #fc8181;'
    return 'background-color: #ffffff;'
  }}

  &:hover { filter: brightness(0.95); }
`

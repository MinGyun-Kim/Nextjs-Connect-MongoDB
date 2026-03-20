'use client'

import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { useRouter } from 'next/navigation'

/**
 * Mypage 컴포넌트
 * 
 * 기능: 일반 사용자가 로그인 후 자신의 정보를 조회/수정하고 장바구니, 구매내역을 확인하는 곳입니다.
 */
export default function Mypage() {
  const router = useRouter()
  // 현재 접속한 유저의 기본 정보 (로컬스토리지 기반)
  const [currentUser, setCurrentUser] = useState<any>(null)
  
  // 탭 상태: 'info' (정보수정), 'cart' (장바구니), 'orders' (구매내역)
  const [activeTab, setActiveTab] = useState<'info' | 'cart' | 'orders'>('info')

  // --- [정보 수정 탭] 관련 상태 ---
  const [isPasswordVerified, setIsPasswordVerified] = useState(false) // 비밀번호 인증 통과 여부
  const [verifyPassword, setVerifyPassword] = useState('') // 인증을 위해 입력하는 기존 비밀번호
  
  // 정보 수정을 위해 폼에 바인딩되는 상태들 (인증 통과 시 DB 데이터로 채워짐)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [roadAddress, setRoadAddress] = useState('')
  const [detailAddress, setDetailAddress] = useState('')
  const [newPassword, setNewPassword] = useState('') // (선택) 변경할 새 비밀번호

  // 1. 컴포넌트 마운트 시 권한 확인
  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      const user = JSON.parse(userStr)
      // 권한 검사: 이 페이지는 구매자(general)만 접근하도록 유도할 수도 있지만, 일단 로그인 유저면 띄워줍니다.
      setCurrentUser(user)
    } else {
      alert('로그인이 필요한 페이지입니다.')
      router.push('/auth?type=login')
    }
  }, [router])

  // --- 비밀번호 확인 기능 (본인 인증) ---
  const handleVerifyPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!verifyPassword) return alert('비밀번호를 입력해주세요.')

    try {
      // 작성해둔 백엔드 API로 인증 요청
      const res = await fetch('/api/user/verify-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: currentUser?.username,
          password: verifyPassword
        })
      })
      const data = await res.json()

      if (res.ok && data.valid) {
        // 인증에 성공하면 데이터(user)를 받아와 폼의 초기값으로 셋팅
        setIsPasswordVerified(true)
        setName(data.user.name || '')
        setEmail(data.user.email || '')
        setRoadAddress(data.user.roadAddress || '')
        setDetailAddress(data.user.detailAddress || '')
      } else {
        alert(data.message || '비밀번호가 일치하지 않습니다.')
      }
    } catch (err) {
      console.error(err)
      alert('서버 오류가 발생했습니다.')
    }
  }

  // --- 내 정보 수정(업데이트) 기능 ---
  const handleUpdateInfo = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const payload = {
        username: currentUser?.username, // 누굴 업데이트 할 지 식별용
        name,
        email,
        roadAddress,
        detailAddress,
        newPassword
      }

      const res = await fetch('/api/user/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await res.json()

      if (res.ok) {
        alert('회원정보가 성공적으로 반영되었습니다!')
        // 새 비밀번호를 바꿨다면 초기화
        setNewPassword('') 
      } else {
        alert(data.message || '업데이트에 실패했습니다.')
      }
    } catch (err) {
      console.error(err)
      alert('서버 업로드 중 오류가 발생했습니다.')
    }
  }

  // 아직 로딩중(유저 정보 파싱중)이라면 보여줄 임시 화면
  if (!currentUser) return <LoadingScreen>유저 정보 확인 중...</LoadingScreen>

  return (
    <PageContainer>
      {/* 2. 좌측 사이드바 구조 */}
      <Sidebar>
        <Logo onClick={() => router.push('/')}>Ojosama Shop</Logo>
        <NavList>
          {/* 각 탭을 클릭하면 activeTab 상태가 바뀜 */}
          <NavItem $active={activeTab === 'info'} onClick={() => setActiveTab('info')}>
            내 정보 수정
          </NavItem>
          <NavItem $active={activeTab === 'cart'} onClick={() => setActiveTab('cart')}>
            장바구니
          </NavItem>
          <NavItem $active={activeTab === 'orders'} onClick={() => setActiveTab('orders')}>
            구매 내역
          </NavItem>
        </NavList>
        <SidebarFooter>
          {/* 로그아웃 처리 */}
          <LogoutButton onClick={() => {
            localStorage.removeItem('user')
            router.push('/auth?type=login')
          }}>
            로그아웃
          </LogoutButton>
        </SidebarFooter>
      </Sidebar>

      {/* 3. 우측 메인 콘텐츠 공간 */}
      <MainContent>
        {/* 선택된 탭에 따라 렌더링 화면을 분기 (조건부 렌더링) */}
        
        {/* --- [A] 내 정보 수정 탭 --- */}
        {activeTab === 'info' && (
          <ContentArea>
            <Title>내 정보 수정 (보안 인증)</Title>
            
            {/* 비밀번호 인증을 아직 안 했다면 인증 폼 노출 */}
            {!isPasswordVerified ? (
              <AuthCard>
                <AuthIcon>🔒</AuthIcon>
                <AuthMessage>
                  회원님의 소중한 정보 보호를 위해,<br />
                  현재 비밀번호를 한 번 더 입력해주세요.
                </AuthMessage>
                <AuthForm onSubmit={handleVerifyPassword}>
                  <InputField 
                    type="password" 
                    placeholder="현재 비밀번호를 입력" 
                    value={verifyPassword}
                    onChange={(e) => setVerifyPassword(e.target.value)}
                  />
                  <SubmitButton type="submit">확인</SubmitButton>
                </AuthForm>
              </AuthCard>
            ) : (
              // 인증을 완료했다면 회원정보 변경 폼 노출
              <FormCard onSubmit={handleUpdateInfo}>
                <FormHeader>회원정보 수정 폼</FormHeader>

                <FormGroup>
                  <Label>아이디 (변경 불가)</Label>
                  {/* readOnly 속성으로 입력 제한(수정 불가) */}
                  <InputField type="text" value={currentUser.username} readOnly disabled style={{background: '#edf2f7'}} />
                </FormGroup>

                <FormGroup>
                  <Label>이름</Label>
                  <InputField type="text" value={name} onChange={e => setName(e.target.value)} />
                </FormGroup>

                <FormGroup>
                  <Label>이메일</Label>
                  <InputField type="email" value={email} onChange={e => setEmail(e.target.value)} />
                </FormGroup>

                {/* 주소 영역. 추후 Daum 도로명 주소 API를 연동할 수도 있습니다. */}
                <FormGroup>
                  <Label>기본 배송지 (도로명 주소)</Label>
                  <InputField type="text" placeholder="예: 서울특별시 강남구 서초대로 1" value={roadAddress} onChange={e => setRoadAddress(e.target.value)} />
                </FormGroup>

                <FormGroup>
                  <Label>상세 주소</Label>
                  <InputField type="text" placeholder="예: 101동 203호" value={detailAddress} onChange={e => setDetailAddress(e.target.value)} />
                </FormGroup>

                {/* 비밀번호 변경 영역. 입력 안 하면 기존 비밀번호 유지 방침 */}
                <FormGroup>
                  <Label>새 비밀번호 (변경 시에만 입력)</Label>
                  <InputField type="password" placeholder="변경할 새 비밀번호를 입력하세요" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                </FormGroup>

                <UpdateButton type="submit">정보 수정 저장하기</UpdateButton>
              </FormCard>
            )}
          </ContentArea>
        )}

        {/* --- [B] 장바구니 탭 --- */}
        {activeTab === 'cart' && (
          <ContentArea>
            <Title>장바구니 🛒</Title>
            {/* 기능이 구현되기 전까지 빈 상태 화면 노출 */}
            <EmptyStateCard>
              <EmptyIcon>🛍️</EmptyIcon>
              <EmptyTitle>장바구니가 비어 있습니다.</EmptyTitle>
              <EmptyDesc>마음에 드는 상품을 찾아 장바구니에 담아보세요!</EmptyDesc>
              <GoShopButton onClick={() => router.push('/')}>쇼핑 홈으로 가기</GoShopButton>
            </EmptyStateCard>
          </ContentArea>
        )}

        {/* --- [C] 구매 내역 탭 --- */}
        {activeTab === 'orders' && (
          <ContentArea>
            <Title>구매 내역 📦</Title>
            <EmptyStateCard>
              <EmptyIcon>🧾</EmptyIcon>
              <EmptyTitle>최근 구매 내역이 없습니다.</EmptyTitle>
              <EmptyDesc>Ojosama Shop에서 산뜻한 쇼핑을 시작해 보세요!</EmptyDesc>
              <GoShopButton onClick={() => router.push('/')}>상품 둘러보기</GoShopButton>
            </EmptyStateCard>
          </ContentArea>
        )}
      </MainContent>
    </PageContainer>
  )
}

// ======================= Styled Components =======================

const LoadingScreen = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #f7fafc;
  font-size: 1.2rem;
  font-weight: 600;
  color: #4a5568;
`

const PageContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: #edf2f7;
`

const Sidebar = styled.aside`
  width: 250px;
  background-color: #ffffff;
  border-right: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  padding: 2.5rem 1.5rem;
`

const Logo = styled.h1`
  font-size: 1.5rem;
  font-weight: 800;
  color: #2d3748;
  margin: 0 0 2rem 0;
  cursor: pointer;
`

const NavList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  flex: 1;
`

const NavItem = styled.li<{ $active: boolean }>`
  padding: 0.9rem 1rem;
  margin-bottom: 0.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  color: ${({ $active }) => ($active ? '#ffffff' : '#4a5568')};
  background-color: ${({ $active }) => ($active ? '#2b6cb0' : 'transparent')};

  &:hover {
    background-color: ${({ $active }) => ($active ? '#2b6cb0' : '#ebf8ff')};
    color: ${({ $active }) => ($active ? '#ffffff' : '#2b6cb0')};
  }
`

const SidebarFooter = styled.div`
  margin-top: auto;
`

const LogoutButton = styled.button`
  width: 100%;
  padding: 0.8rem;
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
  padding: 3rem 4rem;
  display: flex; /* 요소들을 가운데 정렬하기 위해 flex 컨테이너로 설정 */
  flex-direction: column;
  align-items: center; /* 수평 중앙 정렬 */
`

const ContentArea = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center; /* 안쪽의 아이템들(카드, 폼 등)을 중앙 정렬 */
  width: 100%;
  max-width: 800px;
`

const Title = styled.h2`
  font-size: 1.8rem;
  font-weight: 800;
  color: #2d3748;
  margin-bottom: 2rem;
  text-align: center; /* 제목 텍스트 가운데 정렬 */
`

/* --- 정보 수정 (비밀번호 인증) 카드 --- */
const AuthCard = styled.div`
  background-color: #ffffff;
  padding: 3rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
  text-align: center;
`

const AuthIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
`

const AuthMessage = styled.p`
  color: #4a5568;
  line-height: 1.6;
  margin-bottom: 2rem;
  font-size: 1.05rem;
`

const AuthForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 350px;
  margin: 0 auto;
`

/* --- 일반 정보 수정 폼 카드 --- */
const FormCard = styled.form`
  background-color: #ffffff;
  padding: 2.5rem 3rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%; /* 부모의 max-width까지 늘어나도록 설정하여 넓게 표시 */
`

const FormHeader = styled.h3`
  font-size: 1.3rem;
  font-weight: 700;
  color: #2b6cb0;
  margin-bottom: 0.5rem;
  border-bottom: 2px solid #ebf8ff;
  padding-bottom: 1rem;
  text-align: center; /* 변경 시각적 효과 부여 */
`

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`

const Label = styled.label`
  font-size: 0.95rem;
  font-weight: 600;
  color: #4a5568;
`

const InputField = styled.input`
  padding: 0.8rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #3182ce;
  }
`

const SubmitButton = styled.button`
  padding: 0.8rem;
  background-color: #2b6cb0;
  color: #ffffff;
  font-size: 1rem;
  font-weight: 700;
  border: none;
  border-radius: 8px;
  cursor: pointer;

  &:hover {
    background-color: #2c5282;
  }
`

const UpdateButton = styled(SubmitButton)`
  margin-top: 1.5rem;
  padding: 1rem;
`

/* --- 장바구니 / 주문 내역 빈 상태 카드 --- */
const EmptyStateCard = styled.div`
  background-color: #ffffff;
  padding: 4rem 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
`

const EmptyIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
`

const EmptyTitle = styled.h3`
  font-size: 1.3rem;
  color: #2d3748;
  margin-bottom: 0.5rem;
`

const EmptyDesc = styled.p`
  color: #718096;
  margin-bottom: 2.5rem;
`

const GoShopButton = styled.button`
  padding: 0.8rem 1.5rem;
  background-color: #ffffff;
  color: #2b6cb0;
  border: 2px solid #2b6cb0;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #ebf8ff;
  }
`

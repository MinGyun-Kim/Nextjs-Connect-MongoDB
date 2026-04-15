'use client'

import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { useRouter } from 'next/navigation'

export default function SellerProfile() {
  const router = useRouter()
  // null = 로딩, true = 권한 있음, false = 권한 없음
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)
  
  // 비밀번호 검증 상태 및 입력
  const [isPasswordVerified, setIsPasswordVerified] = useState(false)
  const [inputPassword, setInputPassword] = useState('')

  // 사용자 폼 상태
  const [userInfo, setUserInfo] = useState({
    id: '',
    name: '',
    companyName: '',
    password: '',
    phone: '',
    email: '',
    address: ''
  })

  useEffect(() => {
    const checkAuth = () => {
      const userStr = sessionStorage.getItem('user')
      if (userStr) {
        try {
          const user = JSON.parse(userStr)
          if (user.role === 'seller') {
            setIsAuthorized(true)
            setUserInfo({
              id: user.id || '',
              name: user.name || '',
              companyName: user.companyName || '',
              password: '',
              phone: user.phone || '',
              email: user.email || '',
              address: user.address || ''
            })
            return
          }
        } catch (e) {
          console.error('유저 권한 파싱 오류:', e)
        }
      }
      setIsAuthorized(false)
      alert('판매자 권한이 필요합니다. 판매자 계정으로 로그인해주세요.')
      router.push('/auth?type=login')
    }
    checkAuth()
  }, [router])

  const handlePasswordCheck = () => {
    if (inputPassword === '1234') { // 임시
      setIsPasswordVerified(true)
    } else {
      alert('비밀번호가 일치하지 않습니다. (임시: 1234)')
    }
  }

  const handleProfileUpdate = () => {
    const userStr = sessionStorage.getItem('user')
    if (userStr) {
      try {
        const user = JSON.parse(userStr)
        const updatedUser = { ...user, ...userInfo }
        sessionStorage.setItem('user', JSON.stringify(updatedUser))
        alert('판매자 정보가 성공적으로 수정되었습니다.')
      } catch (e) {
        console.error(e)
      }
    }
  }

  if (isAuthorized === null || isAuthorized === false) {
    return <LoadingScreen>권한 확인 중...</LoadingScreen>
  }

  return (
    <DashboardContainer>
      <Sidebar>
        <SidebarLogo onClick={() => router.push('/')}>Ojosama Seller</SidebarLogo>
        <NavList>
          <NavItem onClick={() => router.push('/seller')}>대시보드</NavItem>
          <NavItem onClick={() => router.push('/seller/products')}>상품 관리</NavItem>
          <NavItem onClick={() => router.push('/seller/orders')}>주문 배송 관리</NavItem>
          <NavItem onClick={() => router.push('/seller/stats')}>매출 통계</NavItem>
          <NavItem className="active" onClick={() => router.push('/seller/profile')}>정보 수정</NavItem>
        </NavList>
        <SidebarFooter>
          <LogoutButton
            onClick={() => {
              sessionStorage.removeItem('user')
              router.push('/auth?type=login')
            }}
          >
            로그아웃
          </LogoutButton>
        </SidebarFooter>
      </Sidebar>

      <MainContent>
        <Header>
          <HeaderTitle>정보 수정 ✍️</HeaderTitle>
          <UserInfo>
            <Avatar>👨‍💼</Avatar>
            <span>판매자님 환영합니다</span>
          </UserInfo>
        </Header>

        <ContentArea>
          {!isPasswordVerified ? (
            <AuthCard>
              <AuthIcon>🔒</AuthIcon>
              <AuthMessage>
                판매자님의 소중한 정보 보호를 위해<br />
                현재 비밀번호를 다시 한번 입력해주세요.
              </AuthMessage>
              <AuthForm onSubmit={(e) => { e.preventDefault(); handlePasswordCheck() }}>
                <InputField 
                  type="password" 
                  placeholder="비밀번호 입력"
                  value={inputPassword}
                  onChange={(e) => setInputPassword(e.target.value)}
                />
                <SubmitButton type="submit">확인</SubmitButton>
              </AuthForm>
            </AuthCard>
          ) : (
            <FormCard onSubmit={(e) => { e.preventDefault(); handleProfileUpdate() }}>
              <FormHeader>기본 정보</FormHeader>

              <FormGroup>
                <Label>아이디</Label>
                <InputField type="text" value={userInfo.id} disabled style={{ backgroundColor: '#f7fafc', color: '#a0aec0' }} />
              </FormGroup>

              <FormGroup>
                <Label>이름</Label>
                <InputField 
                  type="text" 
                  value={userInfo.name} 
                  onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })} 
                />
              </FormGroup>

              <FormGroup>
                <Label>회사 이름</Label>
                <InputField 
                  type="text" 
                  value={userInfo.companyName} 
                  onChange={(e) => setUserInfo({ ...userInfo, companyName: e.target.value })} 
                />
              </FormGroup>

              <FormGroup>
                <Label>비밀번호 변경</Label>
                <InputField 
                  type="password" 
                  placeholder="새 비밀번호 (변경시에만 입력)"
                  value={userInfo.password} 
                  onChange={(e) => setUserInfo({ ...userInfo, password: e.target.value })} 
                />
              </FormGroup>

              <FormGroup>
                <Label>전화번호</Label>
                <InputField 
                  type="text" 
                  value={userInfo.phone} 
                  onChange={(e) => setUserInfo({ ...userInfo, phone: e.target.value })} 
                />
              </FormGroup>

              <FormGroup>
                <Label>이메일</Label>
                <InputField 
                  type="email" 
                  value={userInfo.email} 
                  onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })} 
                />
              </FormGroup>

              <FormGroup>
                <Label>회사 주소</Label>
                <InputField 
                  type="text" 
                  value={userInfo.address} 
                  onChange={(e) => setUserInfo({ ...userInfo, address: e.target.value })} 
                />
              </FormGroup>

              <UpdateButton type="submit">정보 수정하기</UpdateButton>
            </FormCard>
          )}
        </ContentArea>
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
  align-items: center;
`

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
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

/* --- 정보 수정 (비밀번호 인증) 카드 UI Components --- */
const ContentArea = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center; 
  width: 100%;
  max-width: 800px;
  margin-top: 2rem;
`

const AuthCard = styled.div`
  background-color: #ffffff;
  padding: 3rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
  text-align: center;
  width: 100%;
  max-width: 500px;
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

const FormCard = styled.form`
  background-color: #ffffff;
  padding: 2.5rem 3rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
`

const FormHeader = styled.h3`
  font-size: 1.3rem;
  font-weight: 700;
  color: #2b6cb0;
  margin-bottom: 0.5rem;
  border-bottom: 2px solid #ebf8ff;
  padding-bottom: 1rem;
  text-align: center;
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

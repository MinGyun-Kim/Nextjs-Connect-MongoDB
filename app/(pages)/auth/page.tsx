'use client'

import { useState, Suspense } from 'react'
import styled from 'styled-components'
import SignUp from './Signup'
import ForgetPassword from './ForgetPass'
import FindId from './FindId' // 아이디 찾기 컴포넌트
import { Gaitwise } from '@/public/svg'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'

function AuthContent() {
  const searchParams = useSearchParams()
  const type = searchParams.get('type')

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'general'|'seller'>('general')

  // 판매자로 로그인 시 회사를 증명할 항목들
  const [companyName, setCompanyName] = useState('')
  const [businessNumber, setBusinessNumber] = useState('')

  const handleLogin = async () => {
    if (!username || !password) return alert('아이디와 비밀번호를 모두 입력해주세요.')
    if (role === 'seller') {
      if (!companyName || !businessNumber) return alert('판매자로 로그인하시려면 회사명과 사업자 등록 번호를 입력해야 합니다.')
    }

    const payload = { 
      username, 
      password, 
      role,
      ...(role === 'seller' && { companyName, businessNumber })
    }

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (res.ok) {
        alert('로그인 성공')
        // 로컬 스토리지에 세션 임시 저장
        localStorage.setItem('user', JSON.stringify({ username, role, ...data.user }))
        
        // 판매자면 판매자 대시보드로, 일반이면 메인 페이지로 이동
        if (role === 'seller') {
          window.location.href = '/seller'
        } else {
          window.location.href = '/'
        }
      } else {
        alert(`로그인 실패: ${data.message}`)
      }
    } catch (e) {
      console.error(e)
      alert('로그인 처리 중 오류가 발생했습니다.')
    }
  }

  return (
    <Container>
      {(!type || type === 'login') && (
        <LoginBox>
          <Title>Ojosama Shop</Title>
          <Subtitle>로그인 유형을 선택해주세요</Subtitle>

          <RoleSelect>
            <label>
              <input
                type="radio"
                name="role"
                value="general"
                checked={role === 'general'}
                onChange={() => setRole('general')}
              />
              일반회원
            </label>
            <label>
              <input
                type="radio"
                name="role"
                value="seller"
                checked={role === 'seller'}
                onChange={() => setRole('seller')}
              />
              판매자
            </label>
          </RoleSelect>

          <InputField
            type="text"
            placeholder="아이디"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <InputField
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {role === 'seller' && (
            <SellerSection>
              <InputGroup>
                <Label>회사명</Label>
                <InputField
                  type="text"
                  placeholder="회사명 (판매자용)"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  style={{ marginBottom: '0.5rem' }}
                />
              </InputGroup>
              <InputGroup>
                <Label>사업자 등록 번호</Label>
                <InputField
                  type="text"
                  placeholder="사업자 등록 번호 (판매자용)"
                  value={businessNumber}
                  onChange={(e) => setBusinessNumber(e.target.value)}
                  style={{ marginBottom: '0' }}
                />
              </InputGroup>
            </SellerSection>
          )}

          <LoginButton onClick={handleLogin}>로그인</LoginButton>

          <Links>
            <p>
              아이디를 잊어버리셨나요? <a href="/auth?type=findid">아이디 찾기</a>
            </p>
            <p>
              비밀번호를 잊어버리셨나요? <a href="/auth?type=forgetpass">비밀번호 찾기</a>
            </p>
            <p style={{ marginTop: '0.5rem' }}>
              계정이 없으신가요? <a href="/auth?type=sign-up">회원가입</a>
            </p>
          </Links>
        </LoginBox>
      )}

      {type === 'sign-up' && <SignUp />}
      {type === 'forgetpass' && <ForgetPassword />}
      {type === 'findid' && <FindId />}
    </Container>
  )
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthContent />
    </Suspense>
  )
}

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-start; /* 내부 컴포넌트가 길어질 때 짤리지 않도록 변경 */
  min-height: 100vh; /* 고정 크기가 아닌 최소 크기로 변경하여 넘칠 경우 늘어나게 함 */
  background-color: #f0f4f8;
  padding: 2rem 0; /* 위아래 스크롤 여유 공간 */
`

const LoginBox = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  text-align: center;
  width: 350px;
  margin: auto; /* align-items가 flex-start일 때 화면 중앙에 위치시키기 위함 */
`

const Title = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
`

const Subtitle = styled.p`
  color: #666;
  margin-bottom: 1.5rem;
`

const RoleSelect = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;

  label {
    margin: 0 1rem;
    font-size: 1rem;
  }
`

const InputField = styled.input`
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  background-color: #f9f9f9;
  color: #1a202c; /* 하얀 배경에서 입력된 글씨가 보이도록 텍스트 색상을 어두운 색으로 지정했습니다. */
`

const LoginButton = styled.button`
  width: 100%;
  padding: 0.75rem;
  background-color: #2d3748;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;

  &:hover {
    background-color: #1a202c;
  }
`

const Links = styled.div`
  margin-top: 1rem;
  font-size: 0.9rem;

  a {
    color: #3182ce;
    text-decoration: none;
    font-weight: 500;
  }

  a:hover {
    text-decoration: underline;
  }
`

const SellerSection = styled.div`
  background-color: #f7fafc;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  border: 1px dashed #cbd5e0;
  text-align: left;
`

const InputGroup = styled.div`
  margin-bottom: 0.5rem;
`

const Label = styled.label`
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 0.3rem;
  color: #4a5568;
`

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
  const [role, setRole] = useState('analyst')

  const handleLogin = async () => {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password, role }),
    })

    if (res.ok) {
      alert('로그인 성공')
    } else {
      alert('로그인 실패')
    }
  }

  return (
    <Container>
      {(!type || type === 'login') && (
        <LoginBox>
          <Title>Welcome Ojosama shopingmall</Title>
          <Subtitle>Please select a Type</Subtitle>

          <RoleSelect>
            <label>
              <input
                type="radio"
                name="role"
                value="analyst"
                checked={role === 'analyst'}
                onChange={(e) => setRole(e.target.value)}
              />
              구매자
            </label>
            <label>
              <input
                type="radio"
                name="role"
                value="doctor"
                checked={role === 'doctor'}
                onChange={(e) => setRole(e.target.value)}
              />
              판매자
            </label>
          </RoleSelect>

          <InputField
            type="email"
            placeholder="ID"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <InputField
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <LoginButton onClick={handleLogin}>Sign In</LoginButton>

          <Links>
            <p>
                {/* 아이디 찾기 버튼 - 클릭 시 아이디 찾기 페이지로 이동 (기능은 추후 구현 예정) */}
                아이디를 잊어버리셨나요? <a href="/auth?type=findid">아이디 찾기</a>
              </p>
            <p>비밀번호를 잊어버리셨나요?<a href="/auth?type=forgetpass"> Forgot password?</a></p>
           
            <p>
              Don’t have an account yet? <a href="/auth?type=sign-up">Sign up</a>
            </p>
          </Links>
        </LoginBox>
      )}

      {type === 'sign-up' && <SignUp />}

      {type === 'forgetpass' && <ForgetPassword />}

      {/* 아이디 찾기 페이지 - 기능은 추후 구현 예정 */}
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

  a {
    color: #3182ce;
    text-decoration: none;
  }

  a:hover {
    text-decoration: underline;
  }
`

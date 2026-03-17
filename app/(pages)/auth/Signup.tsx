'use client'

import React, { useState } from 'react'
import styled from 'styled-components'

export default function SignUp() {
  // --- 상태 관리 (State Management) ---
  const [name, setName] = useState('') // 이름
  const [email, setEmail] = useState('') // 이메일
  const [emailCode, setEmailCode] = useState('') // 이메일 인증 번호
  const [birthdate, setBirthdate] = useState('') // 생년월일
  
  const [username, setUsername] = useState('') // 아이디
  const [isUsernameChecked, setIsUsernameChecked] = useState(false) // 아이디 중복 확인 여부
  
  const [password, setPassword] = useState('') // 비밀번호
  const [passwordConfirm, setPasswordConfirm] = useState('') // 비밀번호 확인

  const [roadAddress, setRoadAddress] = useState('') // 도로명 주소
  const [detailAddress, setDetailAddress] = useState('') // 상세 주소
  
  const [role, setRole] = useState<'general' | 'seller'>('general') // 회원 유형 (일반회원 or 판매자)
  
  const [companyName, setCompanyName] = useState('') // 회사명 (판매자용)
  const [businessNumber, setBusinessNumber] = useState('') // 사업자 등록 번호 (판매자용)

  // 아이디 중복 확인 핸들러
  const handleCheckUsername = async (e: React.MouseEvent) => {
    e.preventDefault()
    
    // 1. 사용자가 아이디 입력칸에 아무것도 적지 않았다면 입력을 유도하는 팝업창을 띄웁니다.
    if (!username) {
      alert('아이디를 입력해주세요.')
      return
    }

    try {
      // 2. 서버의 API 경로('/api/check-username')로 입력한 아이디 검사를 요청합니다. 
      const res = await fetch('/api/check-username', {
        method: 'POST', // 입력 정보를 서버에 안전하게 넘기기 위해 POST 방식을 사용합니다.
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }), // 검사할 아이디 정보를 담아 서버로 전송합니다.
      })
      
      // 3. 서버에서 DB 확인 후 보내준 응답 데이터를 받아옵니다 (JSON 형식).
      const data = await res.json()

      // 4. 응답 성공 시, 서버에서 보내준 중복 여부(data.isAvailable)를 확인합니다.
      if (res.ok && data.isAvailable) {
        // [조건 1] 만약 중복된 아이디가 없다면(사용가능하다면) '사용 가능한 아이디입니다.'라고 팝업창을 띄워줍니다.
        alert('사용 가능한 아이디입니다.')
        // 이후 회원가입 제출 시 중복 확인 절차를 통과했음을 알기 위해 상태를 저장합니다.
        setIsUsernameChecked(true)
      } else {
        // [조건 2] 만약 기존 회원의 아이디와 중복이 된다면 '이미 사용 중인 아이디입니다.'라고 팝업창을 띄워줍니다.
        alert(data.message || '이미 사용 중인 아이디입니다.')
        // 중복된 경우 상태를 false로 두어 회원가입 완료가 안 되게 막습니다.
        setIsUsernameChecked(false)
      }
    } catch (error) {
      console.error(error)
      // 통신 에러 등 예외 상황 발생 시를 대비한 팝업창입니다.
      alert('중복 확인 중 오류가 발생했습니다.')
    }
  }

  // 이메일 인증번호 전송 핸들러
  const handleSendEmailCode = (e: React.MouseEvent) => {
    e.preventDefault()
    if (!email) {
      alert('이메일을 입력해주세요.')
      return
    }
    // TODO: 서버에 이메일 인증번호 발송 요청 (향후 nodemailer 등 연동)
    alert('인증번호가 전송되었습니다. (현재 구현 대기중)')
  }

  // 주소 검색 핸들러 (예: 다음 우편번호 API 연동)
  const handleSearchAddress = (e: React.MouseEvent) => {
    e.preventDefault()
    // TODO: 카카오/다음 우편번호 검색 서비스 연동
    alert('주소 검색 팝업 (Daum Postcode 등 연동 예정)')
  }

  // 회원가입 폼 제출 핸들러
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // [필수 입력란 누락 검사 (수동 알림 로직 추가)]
    // HTML5의 기본 required 속성을 제거하고, 가입하기(submit) 버튼을 눌렀을 때만
    // 누락된 항목이 무엇인지 팝업(alert) 방식으로 직관적으로 띄워주기 위해 아래 로직을 작성했습니다.
    // 기존에 "중복 확인" 버튼을 눌렀을 때도 필드를 채우라고 나오지 않도록 
    // 중복 확인 버튼은 type="button"으로 폼 제출과 분리(별개 취급)했습니다.
    if (!name) return alert('이름을 입력해주세요.')
    if (!birthdate) return alert('생년월일을 입력해주세요.')
    if (!username) return alert('아이디를 입력해주세요.')
    if (!password) return alert('비밀번호를 입력해주세요.')
    if (!passwordConfirm) return alert('비밀번호 확인을 입력해주세요.')
    if (!email) return alert('이메일을 입력해주세요.')
    if (!emailCode) return alert('이메일 인증 번호를 입력해주세요.')
    
    if (role === 'seller') {
      if (!companyName) return alert('회사명을 입력해주세요.')
      if (!businessNumber) return alert('사업자 등록 번호를 입력해주세요.')
    }

    // 유효성 검사 (비밀번호 확인, 아이디 중복확인)
    if (password !== passwordConfirm) {
      alert('비밀번호가 일치하지 않습니다.')
      return
    }
    if (!isUsernameChecked) {
      alert('아이디 중복 확인을 해주세요.')
      return
    }

    // 서버에 보낼 데이터 객체 구성
    const payload = {
      name,
      email,
      birthdate,
      username,
      password,
      roadAddress,
      detailAddress,
      role,
      // 판매자인 경우에만 회사명과 사업자 등록 번호 포함
      ...(role === 'seller' && { companyName, businessNumber }),
    }
    
    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (res.ok) {
        alert('회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.')
        window.location.href = '/auth?type=login' // 이동
      } else {
        alert(`회원가입 실패: ${data.message || '알 수 없는 오류'}`)
      }
    } catch (error) {
      console.error(error)
      alert('회원가입 요청 중 오류가 발생했습니다.')
    }
  }

  return (
    <Container>
      <SignUpBox onSubmit={handleSignUp}>
        <Title>회원 가입</Title>
        <Subtitle>정보를 입력해주세요.</Subtitle>

        {/* 1. 회원 유형 선택 (일반회원 / 판매자) 체크박스(라디오) 형식 */}
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

        {/* 2. 이름 입력란 */}
        <InputGroup>
          <Label>이름</Label>
          <InputField 
            type="text" 
            placeholder="이름을 입력하세요" 
            value={name} 
            onChange={(e) => setName(e.target.value)}
          />
        </InputGroup>
        
        {/* 3. 생년월일 입력란 */}
        <InputGroup>
          <Label>생년월일</Label>
          <InputField 
            type="date" 
            value={birthdate} 
            onChange={(e) => setBirthdate(e.target.value)}
          />
        </InputGroup>

        {/* 4. 아이디 및 중복확인 버튼 */}
        <InputGroup>
          <Label>아이디</Label>
          <FlexRow>
            <InputField 
              type="text" 
              placeholder="아이디를 입력하세요" 
              value={username} 
              onChange={(e) => { 
                setUsername(e.target.value); 
                setIsUsernameChecked(false); // 입력 값이 변경되면 중복 확인 상태 초기화
              }}
            />
            <ActionButton type="button" onClick={handleCheckUsername}>중복 확인</ActionButton>
          </FlexRow>
        </InputGroup>

        {/* 5. 비밀번호 및 비밀번호 확인란 */}
        <InputGroup>
          <Label>비밀번호</Label>
          <InputField 
            type="password" 
            placeholder="비밀번호" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
          />
          <InputField 
            type="password" 
            placeholder="비밀번호 확인" 
            value={passwordConfirm} 
            onChange={(e) => setPasswordConfirm(e.target.value)} 
            style={{ marginTop: '0.5rem' }}
          />
          {password && passwordConfirm && password !== passwordConfirm && (
            <ErrorMessage>비밀번호가 일치하지 않습니다.</ErrorMessage>
          )}
        </InputGroup>

        {/* 6. 이메일 작성란 및 인증번호 확인란 */}
        <InputGroup>
          <Label>이메일</Label>
          <FlexRow>
            <InputField 
              type="email" 
              placeholder="이메일을 입력하세요" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
            />
            <ActionButton type="button" onClick={handleSendEmailCode}>인증번호 발송</ActionButton>
          </FlexRow>
          <InputField 
            type="text" 
            placeholder="이메일 인증 번호를 입력하세요" 
            value={emailCode} 
            onChange={(e) => setEmailCode(e.target.value)} 
            style={{ marginTop: '0.5rem' }}
          />
        </InputGroup>

        {/* 7. 주소 입력란 (도로명 주소 / 상세 주소 분리) */}
        <InputGroup>
          <Label>주소</Label>
          <FlexRow>
             <InputField 
               type="text" 
               placeholder="도로명 주소 (검색 기능을 연동하세요)" 
               value={roadAddress} 
               onChange={(e) => setRoadAddress(e.target.value)}
             />
             <ActionButton type="button" onClick={handleSearchAddress}>주소 검색</ActionButton>
          </FlexRow>
          <InputField 
            type="text" 
            placeholder="상세 주소를 입력하세요" 
            value={detailAddress} 
            onChange={(e) => setDetailAddress(e.target.value)} 
            style={{ marginTop: '0.5rem' }} 
          />
        </InputGroup>

        {/* 8. 만약 판매자라면 회사 및 사업자 등록 확인란 추가 렌더링 */}
        {role === 'seller' && (
          <SellerSection>
            <InputGroup>
              <Label>회사명</Label>
              <InputField 
                type="text" 
                placeholder="회사명을 입력하세요" 
                value={companyName} 
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </InputGroup>
            <InputGroup>
              <Label>사업자 등록 번호</Label>
              <InputField 
                type="text" 
                placeholder="사업자 등록 번호를 입력하세요" 
                value={businessNumber} 
                onChange={(e) => setBusinessNumber(e.target.value)}
              />
            </InputGroup>
          </SellerSection>
        )}

        {/* 회원가입 제출 버튼 */}
        <SignUpButton type="submit">가입하기</SignUpButton>

        <Links>
          <a href="/auth?type=login">이미 계정이 있으신가요? 로그인</a>
        </Links>
      </SignUpBox>
    </Container>
  )
}

// --- Styled Components (스타일 정의) ---
const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f0f2f5;
  padding: 2rem;
`

const SignUpBox = styled.form`
  background: white;
  padding: 2.5rem 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 480px;
`

const Title = styled.h2`
  font-size: 1.8rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  text-align: center;
  color: #1a202c;
`

const Subtitle = styled.p`
  color: #718096;
  margin-bottom: 2rem;
  text-align: center;
  font-size: 0.95rem;
`

const RoleSelect = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
  gap: 1.5rem;

  label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1rem;
    cursor: pointer;
    font-weight: 500;
  }
`

const InputGroup = styled.div`
  margin-bottom: 1.25rem;
  text-align: left;
`

const Label = styled.label`
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #4a5568;
`

const FlexRow = styled.div`
  display: flex;
  gap: 0.5rem;
`

const InputField = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  background-color: #f8fafc;
  color: #1a202c; /* 하얀 배경에서 입력된 글씨가 보이도록 텍스트 색상을 어두운 색으로 지정했습니다. */
  box-sizing: border-box;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #3182ce;
    background-color: #ffffff;
  }
`

const ActionButton = styled.button`
  padding: 0.75rem 1rem;
  background-color: #edf2f7;
  color: #2d3748;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  white-space: nowrap;
  transition: background-color 0.2s;

  &:hover {
    background-color: #e2e8f0;
  }
`

const SellerSection = styled.div`
  background-color: #f7fafc;
  padding: 1.25rem;
  border-radius: 8px;
  margin-bottom: 1.25rem;
  border: 1px dashed #cbd5e0;
`

const ErrorMessage = styled.p`
  color: #e53e3e;
  font-size: 0.8rem;
  margin-top: 0.25rem;
`

const SignUpButton = styled.button`
  width: 100%;
  padding: 1rem;
  background-color: #2b6cb0;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.1rem;
  font-weight: bold;
  margin-top: 1rem;
  transition: background-color 0.2s;

  &:hover {
    background-color: #2c5282;
  }
`

const Links = styled.div`
  margin-top: 1.5rem;
  text-align: center;

  a {
    color: #3182ce;
    text-decoration: none;
    font-size: 0.9rem;
    font-weight: 500;
  }

  a:hover {
    text-decoration: underline;
  }
`

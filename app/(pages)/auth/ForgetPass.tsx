'use client'

// useState: 컴포넌트의 상태(state) 관리를 위한 React 훅
import { useState } from 'react'
// useRouter: 페이지 이동을 위한 Next.js 훅
import { useRouter } from 'next/navigation'
// styled-components: CSS-in-JS 방식으로 컴포넌트 스타일을 정의하기 위한 라이브러리
import styled from 'styled-components'

/**
 * ForgetPassword 컴포넌트
 * 비밀번호를 찾기(재설정) 위한 인증 과정을 5단계로 구현합니다.
 *
 * [Step 1] 아이디 입력 → POST /api/check-username
 *   - 아이디가 DB에 존재하면 → Step 2로 이동
 *   - 아이디가 DB에 없으면   → 오류 메시지 표시
 *
 * [Step 2] 이메일 입력 → POST /api/check-id-email-match
 *   - 아이디와 이메일이 일치하면 → 인증번호 발송 (POST /api/send-email-code) 후 Step 3으로 이동
 *   - 일치하지 않으면 → 오류 메시지 표시
 *
 * [Step 3] 인증번호 입력 → POST /api/verify-email-code
 *   - 인증번호가 맞으면  → Step 4로 이동
 *   - 인증번호가 틀리면  → 오류 메시지 표시
 *
 * [Step 4] 새 비밀번호 입력 → POST /api/reset-password
 *   - 새 비밀번호와 확인용 비밀번호가 일치하는지 확인
 *   - 서버에서 비밀번호 변경 성공 시 → Step 5로 이동
 *
 * [Step 5] 비밀번호 재설정 완료
 *   - 재설정 완료 안내 메시지 표시 및 로그인 페이지 이동 유도
 */
export default function ForgetPassword() {
  const router = useRouter()

  // ─── Step 관리 ────────────────────────────────────────────────
  // 1=아이디입력, 2=이메일입력, 3=인증번호입력, 4=새비밀번호입력, 5=결과확인
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1)

  // ─── 입력 상태 ────────────────────────────────────────────────
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // ─── UI 상태 ────────────────────────────────────────────────
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  /**
   * [Step 1] 아이디 존재 여부 확인
   */
  const handleCheckUsername = async () => {
    if (!username.trim()) {
      setErrorMessage('아이디를 입력해주세요.')
      return
    }

    setIsLoading(true)
    setErrorMessage('')

    try {
      const res = await fetch('/api/check-username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      })
      const data = await res.json()

      // check-username API는 isAvailable: false일 때(이미 존재할 때) 아이디가 있는 것입니다.
      if (res.ok && data.isAvailable === false) {
        setStep(2)
      } else {
        setErrorMessage('등록된 아이디가 없습니다.')
      }
    } catch (error) {
      console.error('아이디 확인 오류:', error)
      setErrorMessage('서버에 연결할 수 없습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * [Step 2] 이메일 일치 여부 확인 + 인증번호 발송
   */
  const handleCheckEmail = async () => {
    if (!email.trim()) {
      setErrorMessage('이메일을 입력해주세요.')
      return
    }

    setIsLoading(true)
    setErrorMessage('')

    try {
      // 1. 아이디와 이메일 매칭 점검
      const matchRes = await fetch('/api/check-id-email-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email }),
      })
      const matchData = await matchRes.json()

      if (!matchRes.ok || !matchData.found) {
        setErrorMessage(matchData.message || '아이디와 이메일 정보가 일치하지 않습니다.')
        return
      }

      // 2. 인증번호 발송
      const sendRes = await fetch('/api/send-email-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const sendData = await sendRes.json()

      if (!sendRes.ok || !sendData.success) {
        setErrorMessage(sendData.message || '인증번호 발송에 실패했습니다.')
        return
      }

      setStep(3)
    } catch (error) {
      console.error('이메일 확인/발송 오류:', error)
      setErrorMessage('서버에 연결할 수 없습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * [Step 3] 인증번호 검증
   */
  const handleVerifyCode = async () => {
    if (!code.trim()) {
      setErrorMessage('인증번호를 입력해주세요.')
      return
    }

    setIsLoading(true)
    setErrorMessage('')

    try {
      const res = await fetch('/api/verify-email-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      })
      const data = await res.json()

      if (data.isValid) {
        setStep(4)
      } else {
        setErrorMessage(data.message || '인증번호가 올바르지 않습니다.')
      }
    } catch (error) {
      console.error('인증번호 확인 오류:', error)
      setErrorMessage('서버에 연결할 수 없습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * [Step 4] 비밀번호 재설정
   * 입력받은 새 비밀번호로 DB의 회원 비밀번호를 업데이트합니다.
   */
  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      setErrorMessage('새 비밀번호를 모두 입력해주세요.')
      return
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('비밀번호가 일치하지 않습니다.')
      return
    }

    setIsLoading(true)
    setErrorMessage('')

    try {
      const res = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, newPassword }),
      })
      const data = await res.json()

      if (res.ok) {
        // 성공 시 Step 5로 이동
        setStep(5)
      } else {
        // 서버에서 isSame: true 로 응답이 오면 기존 비밀번호와 동일한 경우입니다.
        if (data.isSame) {
          // 브라우저 팝업(alert)을 띄우고
          alert(data.message || '똑같은 비밀번호는 사용할 수 없습니다.')
          // 안전을 위해 다시 편하게 입력할 수 있도록 입력값을 비워줍니다.
          setNewPassword('')
          setConfirmPassword('')
        } else {
          setErrorMessage(data.message || '비밀번호 변경에 실패했습니다.')
        }
      }
    } catch (error) {
      console.error('비밀번호 변경 오류:', error)
      setErrorMessage('서버에 연결할 수 없습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ForgetPasswordBox>
      <Title>비밀번호 재설정</Title>

      {/* ── Step 1: 아이디 입력 ────────────────────── */}
      {step === 1 && (
        <>
          <Subtitle>비밀번호를 재설정할 아이디를 입력해주세요.</Subtitle>
          <InputField
            type="text"
            placeholder="아이디 입력"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCheckUsername()}
          />
          <ActionButton onClick={handleCheckUsername} disabled={isLoading}>
            {isLoading ? '확인 중...' : '다음'}
          </ActionButton>
        </>
      )}

      {/* ── Step 2: 이메일 입력 ────────────────────── */}
      {step === 2 && (
        <>
          <Subtitle>가입 시 등록한 이메일을 입력해주세요.</Subtitle>
          <InputField
            type="email"
            placeholder="이메일 입력"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCheckEmail()}
          />
          <ActionButton onClick={handleCheckEmail} disabled={isLoading}>
            {isLoading ? '확인 중...' : '다음'}
          </ActionButton>
        </>
      )}

      {/* ── Step 3: 인증번호 입력 ──────────────────── */}
      {step === 3 && (
        <>
          <Subtitle>
            <strong>{email}</strong>으로 인증번호를 발송했습니다.<br />
            6자리 인증번호를 입력해주세요.
          </Subtitle>
          <InputField
            type="text"
            placeholder="인증번호 6자리 입력"
            value={code}
            maxLength={6}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleVerifyCode()}
          />
          <ActionButton onClick={handleVerifyCode} disabled={isLoading}>
            {isLoading ? '확인 중...' : '인증번호 확인'}
          </ActionButton>
          <ResendButton onClick={handleCheckEmail} disabled={isLoading}>
            인증번호 재발송
          </ResendButton>
        </>
      )}

      {/* ── Step 4: 새 비밀번호 입력 ───────────────── */}
      {step === 4 && (
        <>
          <Subtitle>인증이 완료되었습니다.<br />새로운 비밀번호를 입력해주세요.</Subtitle>
          <InputField
            type="password"
            placeholder="새 비밀번호"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <InputField
            type="password"
            placeholder="새 비밀번호 확인"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleResetPassword()}
          />
          <ActionButton onClick={handleResetPassword} disabled={isLoading}>
            {isLoading ? '변경 중...' : '비밀번호 변경'}
          </ActionButton>
        </>
      )}

      {/* ── Step 5: 비밀번호 재설정 완료 ───────────────── */}
      {step === 5 && (
        <>
          {/* Subtitle 줄 전체 삭제 */}
          <ResultBox>
            <ResultLabel>변경 성공</ResultLabel>
            <ResultUsername>비밀번호 변경이 완료됐습니다.</ResultUsername>
          </ResultBox>
          <ActionButton onClick={() => router.push('/auth?type=login')}>
            로그인하러 가기
          </ActionButton>
        </>
      )}

      {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}

      {/* 성공 화면(Step 5)에서는 돌아가기 버튼 생략 가능하지만, 일단 유지 */}
      {step !== 5 && <BackLink href="/auth?type=login">← 로그인으로 돌아가기</BackLink>}
    </ForgetPasswordBox>
  )
}

// ─── Styled Components ───────────────────────────────────────────────────────

const ForgetPasswordBox = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  text-align: center;
  width: 350px;
`

const Title = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
`

const Subtitle = styled.p`
  color: #555;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
  line-height: 1.6;
`

const InputField = styled.input`
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  background-color: #f9f9f9;
  color: #1a202c;
  box-sizing: border-box;
`

const ActionButton = styled.button`
  width: 100%;
  padding: 0.75rem;
  background-color: #2d3748;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  margin-bottom: 0.75rem;

  &:hover {
    background-color: #1a202c;
  }

  &:disabled {
    background-color: #cbd5e0;
    cursor: not-allowed;
  }
`

const ResendButton = styled.button`
  width: 100%;
  padding: 0.6rem;
  background-color: transparent;
  color: #3182ce;
  border: 1px solid #3182ce;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  margin-bottom: 1rem;

  &:hover {
    background-color: #ebf8ff;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const ResultBox = styled.div`
  background-color: #f0fff4;
  border: 1px solid #9ae6b4;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
`

const ResultLabel = styled.p`
  font-size: 0.85rem;
  color: #276749;
  margin-bottom: 0.5rem;
`

const ResultUsername = styled.p`
  font-size: 1.1rem;
  font-weight: 700;
  color: #22543d;
  letter-spacing: 0.5px;
`

const ErrorMessage = styled.p`
  color: #c53030;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 1rem;
`

const BackLink = styled.a`
  display: block;
  color: #3182ce;
  text-decoration: none;
  font-size: 0.9rem;
  margin-top: 0.5rem;

  &:hover {
    text-decoration: underline;
  }
`

'use client'

// useState: 컴포넌트의 상태(state) 관리를 위한 React 훅
import { useState } from 'react'
// useRouter: 페이지 이동을 위한 Next.js 훅
import { useRouter } from 'next/navigation'
// styled-components: CSS-in-JS 방식으로 컴포넌트 스타일을 정의하기 위한 라이브러리
import styled from 'styled-components'

/**
 * FindId 컴포넌트
 * 이메일로 아이디를 찾는 기능을 3단계로 구현합니다.
 *
 * [Step 1] 이메일 입력 → POST /api/find-id-by-email
 *   - 이메일이 DB에 존재하면 → Step 2로 이동 (인증번호 발송)
 *   - 이메일이 DB에 없으면   → "회원가입하겠습니까?" 팝업 표시
 *
 * [Step 2] 인증번호 입력 → POST /api/verify-email-code
 *   - 인증번호가 맞으면  → Step 3으로 이동 (아이디 표시)
 *   - 인증번호가 틀리면  → 오류 메시지 표시
 *
 * [Step 3] 아이디 확인 완료
 *   - 해당 이메일에 연결된 아이디(username)를 화면에 표시합니다.
 */
export default function FindId() {
  const router = useRouter() // 페이지 이동에 사용

  // ─── Step 관리 ────────────────────────────────────────────────
  // 현재 진행 단계: 1=이메일입력, 2=인증번호입력, 3=결과확인
  const [step, setStep] = useState<1 | 2 | 3>(1)

  // ─── 입력 상태 ────────────────────────────────────────────────
  // 사용자가 입력한 이메일 주소
  const [email, setEmail] = useState('')
  // 사용자가 입력한 인증번호 (6자리)
  const [code, setCode] = useState('')

  // ─── 결과 상태 ────────────────────────────────────────────────
  // 찾아낸 아이디를 저장 (Step 1에서 미리 조회해둠)
  const [foundUsername, setFoundUsername] = useState('')

  // ─── UI 상태 ────────────────────────────────────────────────
  // API 요청 중 여부 (버튼 중복 클릭 방지용)
  const [isLoading, setIsLoading] = useState(false)
  // 오류 메시지 표시용
  const [errorMessage, setErrorMessage] = useState('')

  /**
   * [Step 1] 이메일 존재 여부 확인 + 인증번호 발송 함수
   * 1. POST /api/find-id-by-email 로 이메일이 DB에 있는지 확인
   * 2. 있으면 POST /api/send-email-code 로 인증번호 발송 후 Step 2로 이동
   * 3. 없으면 "회원가입하겠습니까?" confirm 팝업 표시
   */
  const handleCheckEmail = async () => {
    // 이메일을 입력하지 않은 경우 경고
    if (!email.trim()) {
      setErrorMessage('이메일을 입력해주세요.')
      return
    }

    setIsLoading(true)    // 로딩 시작
    setErrorMessage('')   // 이전 오류 메시지 초기화

    try {
      // ── 1단계: 이메일에 해당하는 아이디가 DB에 있는지 확인 ──
      const checkRes = await fetch('/api/find-id-by-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }), // 이메일 전송
      })
      const checkData = await checkRes.json()

      if (!checkRes.ok) {
        // 서버 오류 발생 시 메시지 표시
        setErrorMessage(checkData.message || '오류가 발생했습니다.')
        return
      }

      if (!checkData.found) {
        // 해당 이메일로 가입된 계정이 없는 경우 → 회원가입 유도 팝업
        const wantsSignUp = window.confirm(
          '해당 이메일로 가입된 아이디가 없습니다.\n회원가입 페이지로 이동하시겠습니까?'
        )
        if (wantsSignUp) {
          router.push('/auth?type=sign-up') // 회원가입 페이지로 이동
        }
        return
      }

      // 아이디를 미리 저장해 둡니다 (Step 3에서 표시할 용도)
      setFoundUsername(checkData.username)

      // ── 2단계: 해당 이메일로 인증번호 발송 ──
      const sendRes = await fetch('/api/send-email-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }), // 인증번호를 보낼 이메일
      })
      const sendData = await sendRes.json()

      if (!sendRes.ok || !sendData.success) {
        // 이메일 발송 실패 시 오류 메시지 표시
        setErrorMessage(sendData.message || '인증번호 발송에 실패했습니다.')
        return
      }

      // 인증번호 발송 성공 → Step 2(인증번호 입력)로 이동
      setStep(2)
    } catch (error) {
      // 네트워크 오류 등 예기치 못한 예외 처리
      console.error('이메일 확인 오류:', error)
      setErrorMessage('서버에 연결할 수 없습니다. 다시 시도해주세요.')
    } finally {
      setIsLoading(false) // 요청 성공/실패 무관하게 로딩 종료
    }
  }

  /**
   * [Step 2] 인증번호 검증 함수
   * POST /api/verify-email-code 로 사용자가 입력한 번호가 맞는지 확인합니다.
   * - 맞으면 → Step 3 (아이디 공개) 으로 이동
   * - 틀리면 → 오류 메시지 표시
   */
  const handleVerifyCode = async () => {
    // 인증번호를 입력하지 않은 경우 경고
    if (!code.trim()) {
      setErrorMessage('인증번호를 입력해주세요.')
      return
    }

    setIsLoading(true)   // 로딩 시작
    setErrorMessage('')  // 이전 오류 메시지 초기화

    try {
      // 입력한 이메일 + 인증번호를 서버로 전송하여 검증
      const res = await fetch('/api/verify-email-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }), // 이메일과 인증번호 전송
      })
      const data = await res.json()

      if (data.isValid) {
        // 인증번호가 올바른 경우 → Step 3 (결과 화면) 으로 이동
        setStep(3)
      } else {
        // 인증번호가 틀리거나 만료된 경우 → 오류 메시지 표시
        setErrorMessage(data.message || '인증번호가 올바르지 않습니다.')
      }
    } catch (error) {
      // 네트워크 오류 등 예외 처리
      console.error('인증번호 확인 오류:', error)
      setErrorMessage('서버에 연결할 수 없습니다. 다시 시도해주세요.')
    } finally {
      setIsLoading(false) // 로딩 종료
    }
  }

  return (
    // 카드 형태의 박스 레이아웃 — 로그인, 회원가입 페이지와 동일한 디자인을 사용합니다.
    <FindIdBox>
      {/* 페이지 제목 */}
      <Title>아이디 찾기</Title>

      {/* ── Step 1: 이메일 입력 화면 ────────────────────── */}
      {step === 1 && (
        <>
          {/* 안내 문구 */}
          <Subtitle>가입 시 등록한 이메일을 입력해주세요.</Subtitle>

          {/* 이메일 입력 필드 */}
          <InputField
            type="email"
            placeholder="이메일 입력"
            value={email}
            onChange={(e) => setEmail(e.target.value)} // 입력값이 바뀔 때마다 상태 업데이트
            onKeyDown={(e) => e.key === 'Enter' && handleCheckEmail()} // Enter 키로 검색 가능
          />

          {/* 확인 버튼 — 로딩 중에는 비활성화 */}
          <ActionButton onClick={handleCheckEmail} disabled={isLoading}>
            {isLoading ? '확인 중...' : '다음'}
          </ActionButton>
        </>
      )}

      {/* ── Step 2: 인증번호 입력 화면 ──────────────────── */}
      {step === 2 && (
        <>
          {/* 안내 문구 — 어느 이메일로 발송됐는지 표시 */}
          <Subtitle>
            <strong>{email}</strong>으로 인증번호를 발송했습니다.<br />
            이메일을 확인하고 6자리 인증번호를 입력해주세요.
          </Subtitle>

          {/* 인증번호 입력 필드 */}
          <InputField
            type="text"
            placeholder="인증번호 6자리 입력"
            value={code}
            maxLength={6} // 최대 6자리만 입력 가능
            onChange={(e) => setCode(e.target.value)} // 입력값이 바뀔 때마다 상태 업데이트
            onKeyDown={(e) => e.key === 'Enter' && handleVerifyCode()} // Enter 키로 인증 가능
          />

          {/* 인증번호 확인 버튼 */}
          <ActionButton onClick={handleVerifyCode} disabled={isLoading}>
            {isLoading ? '확인 중...' : '인증번호 확인'}
          </ActionButton>

          {/* 인증번호 재발송 링크 — 이메일을 못 받았을 경우 대비 */}
          <ResendButton onClick={handleCheckEmail} disabled={isLoading}>
            인증번호 재발송
          </ResendButton>
        </>
      )}

      {/* ── Step 3: 아이디 확인 완료 화면 ───────────────── */}
      {step === 3 && (
        <>
          {/* 성공 안내 문구 */}
          <Subtitle>이메일 인증이 완료되었습니다!</Subtitle>

          {/* 찾은 아이디를 강조해서 표시 */}
          <ResultBox>
            <ResultLabel>회원님의 아이디</ResultLabel>
            <ResultUsername>{foundUsername}</ResultUsername>
          </ResultBox>

          {/* 로그인 페이지로 이동 버튼 */}
          <ActionButton onClick={() => router.push('/auth?type=login')}>
            로그인하러 가기
          </ActionButton>
        </>
      )}

      {/* 오류 메시지 — 발생했을 경우에만 표시 */}
      {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}

      {/* 로그인 페이지로 돌아가는 링크 */}
      <BackLink href="/auth?type=login">← 로그인으로 돌아가기</BackLink>
    </FindIdBox>
  )
}

// ─── Styled Components ───────────────────────────────────────────────────────

// 아이디 찾기 카드 컨테이너 — 화면 가운데에 배치되는 흰색 카드 박스
const FindIdBox = styled.div`
  background: white;           /* 흰색 배경 */
  padding: 2rem;               /* 내부 여백 */
  border-radius: 12px;         /* 모서리를 둥글게 */
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1); /* 부드러운 그림자 */
  text-align: center;          /* 텍스트 가운데 정렬 */
  width: 350px;                /* 고정 너비 — 다른 카드와 동일한 크기 */
`

// 페이지 제목 스타일
const Title = styled.h2`
  font-size: 1.5rem;    /* 제목 글자 크기 */
  margin-bottom: 0.5rem; /* 아래 여백 */
`

// 안내 문구 스타일 — 각 단계별 지침을 안내하는 텍스트
const Subtitle = styled.p`
  color: #555;           /* 약간 어두운 회색으로 가독성 확보 */
  margin-bottom: 1.5rem; /* 아래 여백 */
  font-size: 0.9rem;     /* 본문보다 약간 작은 글자 크기 */
  line-height: 1.6;      /* 줄 간격 — 여러 줄 안내문구 가독성 향상 */
`

// 이메일 / 인증번호 입력 필드 공통 스타일
const InputField = styled.input`
  width: 100%;             /* 부모 너비에 꽉 채움 */
  padding: 0.75rem;        /* 내부 여백 — 입력하기 편한 크기 */
  margin-bottom: 1rem;     /* 아래 여백 */
  border: 1px solid #ddd;  /* 연한 회색 테두리 */
  border-radius: 8px;      /* 모서리를 둥글게 */
  font-size: 1rem;         /* 입력 글자 크기 */
  background-color: #f9f9f9; /* 살짝 어두운 배경으로 입력 영역 시각적 구분 */
  color: #1a202c;          /* 어두운 텍스트 색상으로 가독성 확보 */
  box-sizing: border-box;  /* padding이 width에 포함되도록 설정 */
`

// 주요 동작 버튼 (다음 / 인증번호 확인 / 로그인하러 가기) 공통 스타일
const ActionButton = styled.button`
  width: 100%;             /* 부모 너비에 꽉 채움 */
  padding: 0.75rem;        /* 내부 여백 */
  background-color: #2d3748; /* 로그인 버튼과 동일한 색상으로 통일감 부여 */
  color: white;            /* 흰색 텍스트 */
  border: none;            /* 테두리 제거 */
  border-radius: 8px;      /* 모서리를 둥글게 */
  cursor: pointer;         /* 포인터 커서로 변경하여 클릭 가능함을 표시 */
  font-size: 1rem;         /* 버튼 글자 크기 */
  margin-bottom: 0.75rem;  /* 아래 여백 */

  &:hover {
    background-color: #1a202c; /* 마우스 오버 시 더 진한 색으로 변경 */
  }

  &:disabled {
    background-color: #cbd5e0; /* 비활성화 상태일 때 회색으로 표시 */
    cursor: not-allowed;       /* 클릭 불가 커서 */
  }
`

// 인증번호 재발송 버튼 — 덜 강조된 보조 버튼 스타일
const ResendButton = styled.button`
  width: 100%;             /* 부모 너비에 꽉 채움 */
  padding: 0.6rem;         /* 주 버튼보다 조금 작은 여백 */
  background-color: transparent; /* 배경 없음 */
  color: #3182ce;          /* 파란색 링크형 텍스트 색상 */
  border: 1px solid #3182ce; /* 파란색 테두리로 구분 */
  border-radius: 8px;      /* 모서리를 둥글게 */
  cursor: pointer;         /* 포인터 커서 */
  font-size: 0.9rem;       /* 주 버튼보다 작은 글자 크기 */
  margin-bottom: 1rem;     /* 아래 여백 */

  &:hover {
    background-color: #ebf8ff; /* 마우스 오버 시 연한 파란 배경 */
  }

  &:disabled {
    opacity: 0.5;          /* 비활성화 시 반투명 처리 */
    cursor: not-allowed;   /* 클릭 불가 커서 */
  }
`

// 찾은 아이디를 표시하는 결과 박스 — 강조된 디자인으로 아이디를 돋보이게 함
const ResultBox = styled.div`
  background-color: #f0fff4; /* 연한 초록 배경 — 성공을 시각적으로 표현 */
  border: 1px solid #9ae6b4; /* 초록 테두리 */
  border-radius: 8px;         /* 모서리를 둥글게 */
  padding: 1rem;              /* 내부 여백 */
  margin-bottom: 1.5rem;      /* 아래 여백 */
`

// 결과 박스 안의 레이블 ("회원님의 아이디")
const ResultLabel = styled.p`
  font-size: 0.85rem; /* 작은 글자 크기 */
  color: #276749;     /* 진한 초록색 텍스트 */
  margin-bottom: 0.5rem; /* 아래 여백 */
`

// 결과 박스 안의 실제 아이디 텍스트 — 크고 굵게 강조
const ResultUsername = styled.p`
  font-size: 1.4rem;  /* 크고 잘 보이는 글자 크기 */
  font-weight: 700;   /* 굵은 글씨 */
  color: #22543d;     /* 더 진한 초록색 */
  letter-spacing: 1px; /* 글자 간격을 살짝 벌려 가독성 향상 */
`

// 오류 메시지 스타일 — 빨간색으로 눈에 띄게 표시
const ErrorMessage = styled.p`
  color: #c53030;       /* 빨간색 — 오류/경고를 시각적으로 표현 */
  font-size: 0.85rem;   /* 작은 글자 크기 */
  font-weight: 600;     /* 굵은 글씨로 강조 */
  margin-bottom: 1rem;  /* 아래 여백 */
`

// 로그인 페이지로 돌아가는 링크 스타일
const BackLink = styled.a`
  display: block;        /* 블록 요소로 만들어 전체 너비 차지 */
  color: #3182ce;        /* 파란색 링크 색상 — 다른 페이지의 링크 색상과 통일 */
  text-decoration: none; /* 기본 밑줄 제거 */
  font-size: 0.9rem;     /* 본문보다 살짝 작은 글자 크기 */
  margin-top: 0.5rem;    /* 위 여백으로 간격 확보 */

  &:hover {
    text-decoration: underline; /* 마우스 오버 시 밑줄 표시 */
  }
`

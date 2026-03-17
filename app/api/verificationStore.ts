// lib/verificationStore.ts
// Next.js (개발 환경)에서 파일이 재실행될 때마다 메모리가 초기화되는 것을 막기 위해
// global 객체에 Map을 저장하여 서버 전체가 하나의 저장소를 공유하도록 만듭니다.

declare global {
  // eslint-disable-next-line no-var
  var verificationStore: Map<string, string> | undefined
}

export const verificationCodes = global.verificationStore || new Map<string, string>()

if (process.env.NODE_ENV !== 'production') {
  global.verificationStore = verificationCodes
}

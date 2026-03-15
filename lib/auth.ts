// lib/auth.ts
import jwt from 'jsonwebtoken'
import { JwtPayload } from '@/types/user'

const JWT_SECRET = process.env.JWT_SECRET as string

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET 환경변수가 설정되지 않았습니다. .env.local 파일을 확인해주세요.')
}

/** JWT 토큰 생성 */
export function signJwt(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

/** JWT 토큰 검증 및 디코딩 */
export function verifyJwt(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload
  } catch {
    return null
  }
}

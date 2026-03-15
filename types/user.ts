export interface User {
  email: string
  nickname: string
  password: string
  role: 'analyst' | 'doctor'
  profile_image_url: string
  user_type: string
  createdAt: Date
  updatedAt: Date
}

export interface JwtPayload {
  userId: string
  email: string
  role: 'analyst' | 'doctor'
}

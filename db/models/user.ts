// db\models\user.ts
import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, default: '' },
    email: { type: String, default: '', unique: true }, // 이메일
    birthdate: { type: String, default: '' }, // 생년월일

    username: { type: String, default: '', unique: true }, // 아이디
    userid: { type: String, default: '' }, // [Fix] 기존 MongoDB index(userid_1) 충돌 방지용 레거시 필드
    password: { type: String, default: '' }, // 암호화된 비밀번호

    roadAddress: { type: String, default: '' }, // 도로명 주소
    detailAddress: { type: String, default: '' }, // 상세 주소

    role: { type: String, enum: ['general', 'seller'], default: 'general' }, // 회원 유형

    // 판매자 정보
    companyName: { type: String, default: '' },
    businessNumber: { type: String, default: '' },

    // 기존 필드
    nickname: { type: String, default: '' },
    profile_image_url: { type: String, default: '' },
    user_type: { type: String, default: '' },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true, // Mongoose가 createdAt과 updatedAt을 자동 관리
    collection: 'user',
  }
)

const User = mongoose.models.User || mongoose.model('User', UserSchema)

export default User

// db\models\user.ts
import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    nickname: { type: String, default: '' },
    password: { type: String, required: true },
    role: { type: String, enum: ['analyst', 'doctor'], required: true },
    profile_image_url: { type: String, default: '' },
    user_type: { type: String, default: '' },
  },
  {
    timestamps: true,
    collection: 'user',
  }
)

const User = mongoose.models.User || mongoose.model('User', UserSchema)

export default User

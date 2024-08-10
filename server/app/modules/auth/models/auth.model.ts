import { hash, compare } from 'bcryptjs'
import { model, Model, Schema } from 'mongoose'

import { IAuthDocument } from '@auth/interfaces/auth.interface'

const SALT_ROUND = 10

const authSchema: Schema = new Schema(
  {
    username: { type: String },
    email: { type: String },
    uId: { type: String },
    roles: [{ type: String }],
    password: { type: String },
    avatarColor: { type: String },
    passwordResetExpires: { type: Number },
    createdAt: { type: Date, default: Date.now },
    passwordResetToken: { type: String, default: '' }
  },
  {
    toJSON: {
      transform(_doc, ret) {
        delete ret.password
        return ret
      }
    }
  }
)

authSchema.pre('save', async function (this: IAuthDocument, next: () => void) {
  const hashedPassword: string = await hash(this.password as string, SALT_ROUND)
  this.password = hashedPassword
  if (!this.roles.length) this.roles.push('user')
  next()
})

authSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  const hashedPassword: string = (this as unknown as IAuthDocument).password!
  return compare(password, hashedPassword)
}

authSchema.methods.hashPassword = async function (password: string): Promise<string> {
  return hash(password, SALT_ROUND)
}

const AuthModel: Model<IAuthDocument> = model<IAuthDocument>('Auth', authSchema, 'auth')
export { AuthModel }

import { ObjectId } from 'mongodb'
import { Document } from 'mongoose'

import { IUserDocument } from '@user/interfaces/user.interface'

declare global {
  namespace Express {
    interface Request {
      currentUser?: AuthPayload
    }
  }
}

export interface AuthPayload {
  uId: string
  iat?: number
  email: string
  userId: string
  roles: string[]
  username: string
  avatarColor: string
}

export interface IAuthDocument extends Document {
  _id: string | ObjectId
  uId: string
  username: string
  email: string
  roles: string[]
  password?: string
  avatarColor: string
  createdAt: Date
  passwordResetToken?: string
  passwordResetExpires?: number | string
  comparePassword(password: string): Promise<boolean>
  hashPassword(password: string): Promise<string>
}

export interface ISignUpData {
  _id: ObjectId
  uId: string
  email: string
  roles: string[]
  username: string
  password: string
  avatarColor: string
}

export interface IAuthJob {
  value?: string | IAuthDocument | IUserDocument
}

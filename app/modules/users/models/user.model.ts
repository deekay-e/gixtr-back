import { ObjectId } from 'mongodb'
import { model, Model, Schema } from 'mongoose'

import { IUserDocument } from '@user/interfaces/user.interface'

const userSchema: Schema = new Schema({
  authId: { type: ObjectId, ref: 'Auth', index: true },
  firstname: { type: String, default: '' },
  lastname: { type: String, default: '' },
  nickname: { type: String, default: '' },
  profilePicture: { type: String, default: '' },
  postsCount: { type: Number, default: 0 },
  followersCount: { type: Number, default: 0 },
  followingCount: { type: Number, default: 0 },
  blocked: [{ type: ObjectId, ref: 'User' }],
  blockedBy: [{ type: ObjectId, ref: 'User' }],
  notifications: {
    messages: { type: Boolean, default: true },
    reactions: { type: Boolean, default: true },
    comments: { type: Boolean, default: true },
    follows: { type: Boolean, default: true }
  },
  social: {
    facebook: { type: String, default: '' },
    instagram: { type: String, default: '' },
    twitter: { type: String, default: '' },
    youtube: { type: String, default: '' }
  },
  work: { type: String, default: '' },
  school: { type: String, default: '' },
  location: { type: String, default: '' },
  quote: { type: String, default: '' },
  bgImageVersion: { type: String, default: '' },
  bgImageId: { type: String, default: '' }
})

const UserModel: Model<IUserDocument> = model<IUserDocument>('User', userSchema, 'users')
export { UserModel }

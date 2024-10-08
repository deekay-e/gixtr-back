import { string } from 'joi'
import { ObjectId } from 'mongodb'
import { Document } from 'mongoose'

export interface IUserDocument extends Document {
  _id: string | ObjectId
  authId: string | ObjectId
  username?: string
  firstname?: string
  lastname?: string
  nickname?: string
  email?: string
  password?: string
  avatarColor?: string
  uId?: string
  postsCount: number
  work: string
  school: string
  quote: string
  location: string
  blocked: ObjectId[]
  blockedBy: ObjectId[]
  followersCount: number
  followingCount: number
  notifications: INotificationSettings
  social: ISocialLinks
  bgImageVersion: string
  bgImageId: string
  profilePicture: string
  createdAt?: Date
  roles?: string[]
}

export interface IResetPasswordParams {
  username: string
  email: string
  ipaddress: string
  date: string
}

export interface INotificationSettings {
  messages: boolean
  reactions: boolean
  comments: boolean
  follows: boolean
}

export interface IBasicInfo {
  firstname: string
  lastname: string
  nickname: string
  quote: string
  work: string
  school: string
  location: string
}

export interface ISocialLinks {
  facebook: string
  instagram: string
  twitter: string
  youtube: string
}

export interface ISearchUser {
  _id: string
  profilePicture: string
  username: string
  email: string
  avatarColor: string
}

export interface ISocketData {
  blockedUser: string
  blockedBy: string
}

export interface ILogin {
  userId: string
}

export interface IRole {
  type: string
  role: string
  userId?: string
}

export interface IUserJob {
  keyOne?: string
  keyTwo?: string
  key?: string
  value?: string | INotificationSettings | IUserDocument | ISocialLinks | IRole
}

export interface IMailJob {
  receiver: string
  template: string
  subject: string
}

export interface IAllUsers {
  users: IUserDocument[]
  totalUsers: number
}

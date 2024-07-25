import { ObjectId } from 'mongodb'
import { Document } from 'mongoose'

import { IUserDocument } from '@user/interfaces/user.interface'

export interface IFollowers {
  userId: string
}

export interface IFollowerDocument extends Document {
  _id: ObjectId | string
  followerId: ObjectId
  followeeId: ObjectId
  createdAt?: Date
}

export interface IFollower {
  _id: ObjectId | string
  followeeId?: IFollowerData
  followerId?: IFollowerData
  createdAt?: Date
}

export interface IFollowerData {
  avatarColor: string
  followersCount: number
  followingCount: number
  profilePicture: string
  postCount: number
  username: string
  uId: string
  _id?: ObjectId
  userProfile?: IUserDocument
}

export interface IFollowerJob {
  userId?: string
  followeeId?: string
  username?: string
  followerDocumentId?: ObjectId
}

export interface IBlockedUserJob {
  userId?: string
  followeeId?: string
  type?: string
}

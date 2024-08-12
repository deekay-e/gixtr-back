import { ObjectId } from 'mongodb'
import { Document } from 'mongoose'

import { IReactions } from '@reaction/interfaces/reaction.interface'

export interface IPostDocument extends Document {
  post: string
  email: string
  userId: string
  bgColor: string
  username: string
  avatarColor: string
  profilePicture: string
  _id?: string | ObjectId
  reactions?: IReactions
  commentsCount: number
  imgVersion?: string
  vidVersion?: string
  feelings?: string
  createdAt?: Date
  gifUrl?: string
  scope?: string
  imgId?: string
  vidId?: string
}

export interface IGetPostsQuery {
  _id?: ObjectId | string
  username?: string
  gifUrl?: string
  imgId?: string
  vidId?: string
}

export interface ISavePost {
  newPost: IPostDocument
  key: ObjectId | string
  currentUserId: string
  uId: string
}

export interface IPostJob {
  key?: string
  keyOne?: string
  keyTwo?: string
  value?: IPostDocument
}

export interface IQueryComplete {
  ok?: number
  n?: number
}

export interface IQueryDeleted {
  deletedCount?: number
}

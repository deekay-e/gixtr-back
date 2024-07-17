import { ObjectId } from 'mongodb'
import { Document } from 'mongoose'

import { IReactions } from '@reaction/interfaces/reaction.interface'

export interface ICommentDocument extends Document {
  _id?: string | ObjectId
  username: string
  avatarColor: string
  postId: string
  profilePicture: string
  comment: string
  reactions?: IReactions
  createdAt?: Date
  userTo?: string | ObjectId
}

export interface ICommentJob {
  postId: string
  userTo: string
  userFrom: string
  username: string
  comment: ICommentDocument
  query?: IQueryComment
  sort?: Record<string, 1 | -1>
}

export interface ICommentNameList {
  count: number
  names: string[]
}

export interface IQueryComment {
  _id?: string | ObjectId
  postId?: string | ObjectId
}

export interface IQuerySort {
  createdAt?: number
}

import { ObjectId } from 'mongodb'
import { Document } from 'mongoose'

export interface INotificationDocument extends Document {
  _id?: ObjectId | string
  userTo: string
  userFrom: string
  message: string
  type: string
  entityId: ObjectId
  createdItemId: ObjectId
  comment: string
  reaction: string
  post: string
  imgId: string
  imgVersion: string
  gifUrl: string
  read?: boolean
  createdAt?: Date
  insertNotification(data: INotification): Promise<void>
}

export interface INotification {
  userTo: string
  userFrom: string
  message: string
  type: string
  entityId: ObjectId
  createdItemId: ObjectId
  createdAt: Date
  comment: string
  reaction: string
  post: string
  imgId: string
  imgVersion: string
  gifUrl: string
}

export interface INotificationJob {
  key?: string
}

export interface INotificationTemplate {
  username: string
  message: string
  header: string
}

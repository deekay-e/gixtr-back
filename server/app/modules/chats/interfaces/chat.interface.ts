import { ObjectId } from 'mongodb'
import { Document } from 'mongoose'

import { AuthPayload } from '@auth/interfaces/auth.interface'
import { IReaction } from '@reaction/interfaces/reaction.interface'

export interface IMessageDocument extends Document {
  _id: ObjectId
  conversationId: ObjectId
  senderId: ObjectId
  receiverId: ObjectId
  senderUsername: string
  senderAvatarColor: string
  senderProfilePicture: string
  receiverUsername: string
  receiverAvatarColor: string
  receiverProfilePicture: string
  body: string
  gifUrl: string
  isRead: boolean
  selectedImage: string
  reaction: IReaction[]
  createdAt: Date
  deleteForMe: boolean
  deleteForEveryone: boolean
}

export interface IMessageData {
  _id: string | ObjectId
  conversationId: ObjectId
  receiverId: string
  receiverUsername: string
  receiverAvatarColor: string
  receiverProfilePicture: string
  senderUsername: string
  senderId: string
  senderAvatarColor: string
  senderProfilePicture: string
  body: string
  isRead: boolean
  gifUrl: string
  selectedImage: string
  reaction: IReaction[]
  createdAt: Date | string
  deleteForMe: boolean
  deleteForEveryone: boolean
}

export interface IMessageNotification {
  currentUser: AuthPayload
  message: string
  receiverName: string
  receiverId: string
  messageData: IMessageData
}

export interface IChatUsers {
  userOne: string
  userTwo: string
}

export interface IChatList {
  receiverId: string
  conversationId: string
}

export interface ITyping {
  sender: string
  receiver: string
}

export interface IChatJob {
  senderId?: ObjectId | string
  receiverId?: ObjectId | string
  messageId?: ObjectId | string
  senderName?: string
  reaction?: string
  type?: string
}

export interface ISenderReceiver {
  senderId: string
  receiverId: string
  senderName: string
  receiverName: string
}

export interface IGetMessageFromCache {
  index: number
  message: string
  receiver: IChatList
}

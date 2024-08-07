import { ObjectId } from 'mongodb'
import { Document } from 'mongoose'

export interface IConversationDocument extends Document {
  _id: ObjectId
  senderId: ObjectId
  receiverId: ObjectId
  createdAt: Date
}

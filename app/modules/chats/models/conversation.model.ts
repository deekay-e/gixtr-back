import { ObjectId } from 'mongodb'
import { Model, model, Schema } from 'mongoose'

import { IConversationDocument } from '@chat/interfaces/conversation.interface'

const conversationSchema: Schema = new Schema({
  senderId: { type: ObjectId, ref: 'User' },
  receiverId: { type: ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
})

const ConversationModel: Model<IConversationDocument> = model<IConversationDocument>(
  'Conversation',
  conversationSchema,
  'conversations'
)
export { ConversationModel }

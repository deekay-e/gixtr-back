import { ObjectId } from 'mongodb'

import { MessageModel } from '@chat/models/chat.model'
import { IMessageData } from '@chat/interfaces/chat.interface'
import { ConversationModel } from '@chat/models/conversation.model'
import { IConversationDocument } from '@chat/interfaces/conversation.interface'

class ChatService {
  public async addMessage(data: IMessageData): Promise<void> {
    const conversations: IConversationDocument[] = await ConversationModel.find({
      _id: data?.conversationId
    }).exec()
    if (!conversations.length) {
      await ConversationModel.create({
        _id: data?.conversationId,
        senderId: data.senderId,
        receiverId: data.receiverId
      })
    }
    await MessageModel.create(data)
  }
}

export const chatService: ChatService = new ChatService()

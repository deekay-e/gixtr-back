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

  public async getUserConversations(key: ObjectId): Promise<IMessageData[]> {
    const messages: IMessageData[] = await MessageModel.aggregate([
      { $match: { $or: [{ senderId: key }, { receiverId: key }] } },
      { $group: {
        _id: '$conversationId',
        result: { $last: '$$ROOT' }
      }},
      { $project: {
        _id: '$result._id',
        body: '$result.body',
        isRead: '$result.isRead',
        gifUrl: '$result.gifUrl',
        reaction: '$result.reaction',
        senderId: '$result.senderId',
        createdAt: '$result.createdAt',
        receiverId: '$result.receiverId',
        deleteForMe: '$result.deleteForMe',
        selectedImage: '$result.selectedImage',
        conversationId: '$result.conversationId',
        senderUsername: '$result.senderUsername',
        receiverUsername: '$result.receiverUsername',
        senderAvatarColor: '$result.senderAvatarColor',
        deleteForEveryone: '$result.deleteForEveryone',
        receiverAvatarColor: '$result.receiverAvatarColor',
        senderProfilePicture: '$result.senderProfilePicture',
        receiverProfilePicture: '$result.receiverProfilePicture'
      }},
      { $sort: { createdAt: 1} }
    ])

    return messages
  }
}

export const chatService: ChatService = new ChatService()

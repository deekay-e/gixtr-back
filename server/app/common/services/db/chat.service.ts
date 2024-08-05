import { ObjectId } from 'mongodb'

import { MessageModel } from '@chat/models/chat.model'
import { ConversationModel } from '@chat/models/conversation.model'
import { IConversationDocument } from '@chat/interfaces/conversation.interface'
import { IChatJob, IChatList, IMessageData } from '@chat/interfaces/chat.interface'

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
      {
        $group: {
          _id: '$conversationId',
          result: { $last: '$$ROOT' }
        }
      },
      {
        $project: {
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
        }
      },
      { $sort: { createdAt: 1 } }
    ])

    return messages
  }

  public async getChatMessages(
    chatList: IChatList,
    sort: Record<string, 1 | -1>
  ): Promise<IMessageData[]> {
    const { senderId, receiverId, conversationId } = chatList
    const query = {
      $or: [
        { conversationId: new ObjectId(conversationId) },
        { senderId: new ObjectId(senderId), receiverId: new ObjectId(receiverId) },
        { senderId: new ObjectId(receiverId), receiverId: new ObjectId(senderId) }
      ]
    }
    const messages: IMessageData[] = await MessageModel.aggregate([
      { $match: query },
      { $sort: sort }
    ])

    return messages
  }

  public async markMessageAsDeleted(chatJob: IChatJob): Promise<void> {
    const { messageId, type } = chatJob
    if (type === 'deleteForMe') {
      await MessageModel.updateOne({ _id: messageId }, { $set: { deleteForMe: true } }).exec()
    } else {
      await MessageModel.updateOne(
        { _id: messageId },
        { $set: { deleteForMe: true, deleteForEveryone: true } }
      ).exec()
    }
  }
}

export const chatService: ChatService = new ChatService()

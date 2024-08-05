import { ObjectId } from 'mongodb'
import { Request, Response } from 'express'
import HTTP_STATUS from 'http-status-codes'

import { ChatCache } from '@service/redis/chat.cache'
import { IChatList, IMessageData } from '@chat/interfaces/chat.interface'
import { chatService } from '@service/db/chat.service'

const chatCache: ChatCache = new ChatCache()

export class ChatGet {
  public async conversations(req: Request, res: Response): Promise<void> {
    const { userId } = req.params
    const currUserId = userId ? userId : req.currentUser!.userId

    const cacheMessages: IMessageData[] = await chatCache.getUserConversations(currUserId)
    const messages: IMessageData[] = cacheMessages.length
      ? cacheMessages
      : await chatService.getUserConversations(new ObjectId(currUserId))

    res.status(HTTP_STATUS.OK).json({ message: 'Get user conversations successful', messages })
  }

  public async messages(req: Request, res: Response): Promise<void> {
    const { receiverId, conversationId } = req.params
    const senderId = req.currentUser!.userId

    const chatList: IChatList = { senderId, receiverId, conversationId } as IChatList
    const cacheMessages: IMessageData[] = await chatCache.getChatMessages(chatList)
    const messages: IMessageData[] = cacheMessages.length
      ? cacheMessages
      : await chatService.getChatMessages(chatList, { createdAt: 1 })

    res.status(HTTP_STATUS.OK).json({ message: 'Get chat messages successful', messages })
  }
}

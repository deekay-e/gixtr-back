import { ObjectId } from 'mongodb'
import { Request, Response } from 'express'
import HTTP_STATUS from 'http-status-codes'

import { ChatCache } from '@service/redis/chat.cache'
import { IMessageData } from '@chat/interfaces/chat.interface'
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
}

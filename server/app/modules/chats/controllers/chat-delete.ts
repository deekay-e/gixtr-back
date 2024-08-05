import { ObjectId } from 'mongodb'
import { Request, Response } from 'express'
import HTTP_STATUS from 'http-status-codes'

import { ChatCache } from '@service/redis/chat.cache'
import { IMessageData } from '@chat/interfaces/chat.interface'
import { socketIOChatObject } from '@socket/chat'
import { chatQueue } from '@service/queues/chat.queue'

const chatCache: ChatCache = new ChatCache()

export class ChatDelete {
  public async setStatus(req: Request, res: Response): Promise<void> {
    const { senderId, receiverId, messageId, type } = req.params

    const cacheMessage: IMessageData = await chatCache.markMessageAsDeleted({
      senderId,
      receiverId,
      messageId,
      type
    })
    socketIOChatObject.emit('message read', cacheMessage)
    socketIOChatObject.emit('chat list', cacheMessage)
    chatQueue.addChatJob('markMessageAsDeleted', { messageId, type })

    res.status(HTTP_STATUS.OK).json({ message: 'Mark message as deleted successful' })
  }
}

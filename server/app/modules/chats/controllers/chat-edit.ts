import { Request, Response } from 'express'
import HTTP_STATUS from 'http-status-codes'

import { socketIOChatObject } from '@socket/chat'
import { ChatCache } from '@service/redis/chat.cache'
import { chatQueue } from '@service/queues/chat.queue'
import { markChatSchema } from '@chat/schemas/chat.schema'
import { IMessageData } from '@chat/interfaces/chat.interface'
import { JoiValidator } from '@global/decorators/joi-validation'

const chatCache: ChatCache = new ChatCache()

export class ChatEdit {
  @JoiValidator(markChatSchema)
  public async markAsRead(req: Request, res: Response): Promise<void> {
    const { senderId, receiverId, conversationId } = req.body

    const cacheMessage: IMessageData = await chatCache.markMessagesAsRead({
      senderId,
      receiverId,
      conversationId
    })
    socketIOChatObject.emit('message read', cacheMessage)
    socketIOChatObject.emit('chat list', cacheMessage)
    chatQueue.addChatJob('markMessagesAsRead', { senderId, receiverId, conversationId })

    res.status(HTTP_STATUS.OK).json({ message: 'Mark messages as read successful' })
  }
}

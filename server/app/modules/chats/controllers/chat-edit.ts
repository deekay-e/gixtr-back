import { Request, Response } from 'express'
import HTTP_STATUS from 'http-status-codes'

import { socketIOChatObject } from '@socket/chat'
import { ChatCache } from '@service/redis/chat.cache'
import { chatQueue } from '@service/queues/chat.queue'
import { JoiValidator } from '@global/decorators/joi-validation'
import { IChatJob, IMessageData } from '@chat/interfaces/chat.interface'
import { markChatSchema, messageReactionSchema } from '@chat/schemas/chat.schema'

const chatCache: ChatCache = new ChatCache()

export class ChatEdit {
  @JoiValidator(markChatSchema)
  public async markAsRead(req: Request, res: Response): Promise<void> {
    const { senderId, receiverId, conversationId } = req.body

    const message: IMessageData = await chatCache.markMessagesAsRead({
      senderId,
      receiverId,
      conversationId
    })
    socketIOChatObject.emit('message read', message)
    socketIOChatObject.emit('chat list', message)
    chatQueue.addChatJob('markMessagesAsRead', { senderId, receiverId, conversationId })

    res.status(HTTP_STATUS.OK).json({ message: 'Mark messages as read successful' })
  }

  @JoiValidator(messageReactionSchema)
  public async messageReaction(req: Request, res: Response): Promise<void> {
    const senderId = req.currentUser!.userId
    const senderName = req.currentUser!.username
    const { messageId, receiverId, reaction, type } = req.body

    const message: IMessageData = await chatCache.updateMessageReaction({
      messageId,
      senderName,
      reaction,
      type,
      senderId,
      receiverId
    })
    socketIOChatObject.emit('message read', message)
    socketIOChatObject.emit('chat list', message)

    const chatJob: IChatJob = { messageId, senderName, reaction, type } as IChatJob
    chatQueue.addChatJob('updateMessageReaction', chatJob)

    res.status(HTTP_STATUS.OK).json({ message: 'Update message reaction successful' })
  }
}

import { Server } from 'socket.io'
import { Request, Response } from 'express'

import * as chatServer from '@socket/chat'
import { existingUser } from '@mock/user.mock'
import { authUserPayload } from '@mock/auth.mock'
import { ChatCache } from '@service/redis/chat.cache'
import { ChatEdit } from '@chat/controllers/chat-edit'
import { chatQueue } from '@service/queues/chat.queue'
import { messageDataMock, mockMessageId, chatMockRequest, chatMockResponse } from '@mock/chat.mock'

jest.useFakeTimers()
jest.mock('@service/queues/base.queue')
jest.mock('@service/redis/message.cache')

Object.defineProperties(chatServer, {
  socketIOChatObject: {
    value: new Server(),
    writable: true
  }
})

describe('ChatEdit', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.clearAllTimers()
  })

  describe('markAsRead', () => {
    it('should send correct json response from redis cache', async () => {
      const req: Request = chatMockRequest(
        {},
        {
          senderId: `${existingUser._id}`,
          receiverId: '60263f14648fed5246e322d8'
        },
        authUserPayload
      ) as Request
      const res: Response = chatMockResponse()
      jest.spyOn(ChatCache.prototype, 'markMessagesAsRead').mockResolvedValue(messageDataMock)
      jest.spyOn(chatServer.socketIOChatObject, 'emit')

      await ChatEdit.prototype.markAsRead(req, res)
      expect(chatServer.socketIOChatObject.emit).toHaveBeenCalledTimes(2)
      expect(chatServer.socketIOChatObject.emit).toHaveBeenCalledWith(
        'message read',
        messageDataMock
      )
      expect(chatServer.socketIOChatObject.emit).toHaveBeenCalledWith('chat list', messageDataMock)
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        message: 'Mark messages as read successful'
      })
    })

    it('should call chatQueue addChatJob', async () => {
      const req: Request = chatMockRequest(
        {},
        {
          senderId: `${existingUser._id}`,
          receiverId: '60263f14648fed5246e322d8'
        },
        authUserPayload
      ) as Request
      const res: Response = chatMockResponse()
      jest.spyOn(ChatCache.prototype, 'markMessagesAsRead').mockResolvedValue(messageDataMock)
      jest.spyOn(chatQueue, 'addChatJob')

      await ChatEdit.prototype.markAsRead(req, res)
      expect(chatQueue.addChatJob).toHaveBeenCalled()
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        message: 'Mark messages as read successful'
      })
    })
  })

  describe('messageReaction', () => {
    it('should call updateMessageReaction', async () => {
      const req: Request = chatMockRequest(
        {},
        {
          conversationId: '602854c81c9ca7939aaeba43',
          messageId: `${mockMessageId}`,
          reaction: 'love',
          type: 'add'
        },
        authUserPayload
      ) as Request
      const res: Response = chatMockResponse()
      jest.spyOn(ChatCache.prototype, 'updateMessageReaction').mockResolvedValue(messageDataMock)
      jest.spyOn(chatServer.socketIOChatObject, 'emit')

      await ChatEdit.prototype.messageReaction(req, res)
      expect(ChatCache.prototype.updateMessageReaction).toHaveBeenCalledWith(
        '602854c81c9ca7939aaeba43',
        `${mockMessageId}`,
        'love',
        `${authUserPayload.username}`,
        'add'
      )
      expect(chatServer.socketIOChatObject.emit).toHaveBeenCalledTimes(1)
      expect(chatServer.socketIOChatObject.emit).toHaveBeenCalledWith(
        'message reaction',
        messageDataMock
      )
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        message: 'Update message reaction successful'
      })
    })

    it('should call chatQueue addChatJob', async () => {
      const req: Request = chatMockRequest(
        {},
        {
          conversationId: '602854c81c9ca7939aaeba43',
          messageId: `${mockMessageId}`,
          reaction: 'love',
          type: 'add'
        },
        authUserPayload
      ) as Request
      const res: Response = chatMockResponse()
      jest.spyOn(chatQueue, 'addChatJob')

      await ChatEdit.prototype.messageReaction(req, res)
      expect(chatQueue.addChatJob).toHaveBeenCalledWith('updateMessageReaction', {
        messageId: mockMessageId,
        senderName: req.currentUser!.username,
        reaction: 'love',
        type: 'add'
      })
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        message: 'Update message reaction successful'
      })
    })
  })
})

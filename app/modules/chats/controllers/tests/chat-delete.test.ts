import { ObjectId } from 'mongodb'
import { Server } from 'socket.io'
import { Request, Response } from 'express'

import * as chatServer from '@socket/chat'
import { existingUser } from '@mock/user.mock'
import { authUserPayload } from '@mock/auth.mock'
import { messageDataMock } from '@mock/chat.mock'
import { ChatCache } from '@service/redis/chat.cache'
import { chatQueue } from '@service/queues/chat.queue'
import { ChatDelete } from '@chat/controllers/chat-delete'
import { chatMockRequest, chatMockResponse, mockMessageId } from '@mock/chat.mock'

jest.useFakeTimers()
jest.mock('@service/redis/chat.cache')
jest.mock('@service/queues/base.queue')

Object.defineProperties(chatServer, {
  socketIOChatObject: {
    value: new Server(),
    writable: true
  }
})

describe('ChatDelete', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.clearAllTimers()
  })

  describe('setStatus', () => {
    it('should send correct json response (deleteForMe)', async () => {
      const req: Request = chatMockRequest({}, {}, authUserPayload, {
        senderId: `${existingUser._id}`,
        receiverId: '60263f14648fed5246e322d8',
        messageId: `${mockMessageId}`,
        type: 'deleteForMe'
      }) as Request
      const res: Response = chatMockResponse()
      jest.spyOn(ChatCache.prototype, 'markMessageAsDeleted').mockResolvedValue(messageDataMock)
      jest.spyOn(chatServer.socketIOChatObject, 'emit')
      jest.spyOn(chatQueue, 'addChatJob')

      await ChatDelete.prototype.setStatus(req, res)
      expect(chatServer.socketIOChatObject.emit).toHaveBeenCalledTimes(2)
      expect(chatServer.socketIOChatObject.emit).toHaveBeenCalledWith(
        'message read',
        messageDataMock
      )
      expect(chatServer.socketIOChatObject.emit).toHaveBeenCalledWith('chat list', messageDataMock)
      expect(chatQueue.addChatJob).toHaveBeenCalledWith('markMessageAsDeleted', {
        messageId: new ObjectId(mockMessageId),
        type: 'deleteForMe'
      })
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        message: 'Mark message as deleted successful'
      })
    })

    it('should send correct json response (deleteForEveryone)', async () => {
      const req: Request = chatMockRequest({}, {}, authUserPayload, {
        senderId: `${existingUser._id}`,
        receiverId: '60263f14648fed5246e322d8',
        messageId: `${mockMessageId}`,
        type: 'deleteForEveryone'
      }) as Request
      const res: Response = chatMockResponse()
      jest.spyOn(ChatCache.prototype, 'markMessageAsDeleted').mockResolvedValue(messageDataMock)
      jest.spyOn(chatServer.socketIOChatObject, 'emit')
      jest.spyOn(chatQueue, 'addChatJob')

      await ChatDelete.prototype.setStatus(req, res)
      expect(chatServer.socketIOChatObject.emit).toHaveBeenCalledTimes(2)
      expect(chatServer.socketIOChatObject.emit).toHaveBeenCalledWith(
        'message read',
        messageDataMock
      )
      expect(chatServer.socketIOChatObject.emit).toHaveBeenCalledWith('chat list', messageDataMock)
      expect(chatQueue.addChatJob).toHaveBeenCalledWith('markMessageAsDeleted', {
        messageId: new ObjectId(mockMessageId),
        type: 'deleteForEveryone'
      })
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        message: 'Mark message as deleted successful'
      })
    })
  })
})

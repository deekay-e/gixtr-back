import { Request, Response } from 'express'

import { authUserPayload } from '@mock/auth.mock'
import { ChatGet } from '@chat/controllers/chat-get'
import { ChatCache } from '@service/redis/chat.cache'
import { chatService } from '@service/db/chat.service'
import { chatMessage, chatMockRequest, chatMockResponse, messageDataMock } from '@mock/chat.mock'

jest.useFakeTimers()
jest.mock('@service/queues/base.queue')
jest.mock('@service/redis/message.cache')

describe('ChatGet', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.clearAllTimers()
  })

  describe('conversations', () => {
    it('should send correct json response if chat list exist in redis', async () => {
      const req: Request = chatMockRequest({}, {}, authUserPayload) as Request
      const res: Response = chatMockResponse()
      jest.spyOn(ChatCache.prototype, 'getUserConversations').mockResolvedValue([messageDataMock])

      await ChatGet.prototype.conversations(req, res)
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        message: 'Get user conversations successful',
        list: [messageDataMock]
      })
    })

    it('should send correct json response if no chat list response from redis', async () => {
      const req: Request = chatMockRequest({}, {}, authUserPayload) as Request
      const res: Response = chatMockResponse()
      jest.spyOn(ChatCache.prototype, 'getUserConversations').mockResolvedValue([])
      jest.spyOn(chatService, 'getUserConversations').mockResolvedValue([messageDataMock])

      await ChatGet.prototype.conversations(req, res)
      expect(chatService.getUserConversations).toHaveBeenCalled()
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        message: 'Get user conversations successful',
        list: [messageDataMock]
      })
    })

    it('should send correct json response with empty chat list if it does not exist (redis & database)', async () => {
      const req: Request = chatMockRequest({}, chatMessage, authUserPayload) as Request
      const res: Response = chatMockResponse()
      jest.spyOn(ChatCache.prototype, 'getUserConversations').mockResolvedValue([])
      jest.spyOn(chatService, 'getUserConversations').mockResolvedValue([])

      await ChatGet.prototype.conversations(req, res)
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        message: 'Get user conversations successful',
        list: []
      })
    })
  })

  describe('messages', () => {
    it('should send correct json response if chat messages exist in redis', async () => {
      const req: Request = chatMockRequest({}, chatMessage, authUserPayload, {
        receiverId: '60263f14648fed5246e322d8'
      }) as Request
      const res: Response = chatMockResponse()
      jest.spyOn(ChatCache.prototype, 'getChatMessages').mockResolvedValue([messageDataMock])

      await ChatGet.prototype.messages(req, res)
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        message: 'Get chat messages successful',
        messages: [messageDataMock]
      })
    })

    it('should send correct json response if no chat message response from redis', async () => {
      const req: Request = chatMockRequest({}, chatMessage, authUserPayload, {
        receiverId: '60263f14648fed5246e322d8'
      }) as Request
      const res: Response = chatMockResponse()
      jest.spyOn(ChatCache.prototype, 'getChatMessages').mockResolvedValue([])
      jest.spyOn(chatService, 'getChatMessages').mockResolvedValue([messageDataMock])

      await ChatGet.prototype.messages(req, res)
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        message: 'Get chat messages successful',
        messages: [messageDataMock]
      })
    })

    it('should send correct json response with empty chat messages if it does not exist (redis & database)', async () => {
      const req: Request = chatMockRequest({}, chatMessage, authUserPayload, {
        receiverId: '6064793b091bf02b6a71067a'
      }) as Request
      const res: Response = chatMockResponse()
      jest.spyOn(ChatCache.prototype, 'getChatMessages').mockResolvedValue([])
      jest.spyOn(chatService, 'getChatMessages').mockResolvedValue([])

      await ChatGet.prototype.messages(req, res)
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        message: 'Get chat messages successful',
        messages: []
      })
    })
  })
})

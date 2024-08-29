import { ObjectId } from 'mongodb'
import { Server } from 'socket.io'
import { Request, Response } from 'express'

import * as chatServer from '@socket/chat'
import { authUserPayload } from '@mock/auth.mock'
import { ChatAdd } from '@chat/controllers/chat-add'
import { ChatCache } from '@service/redis/chat.cache'
import { UserCache } from '@service/redis/user.cache'
import { chatQueue } from '@service/queues/chat.queue'
import { mailQueue } from '@service/queues/mail.queue'
import { existingUser, existingUserTwo } from '@mock/user.mock'
import { notification } from '@service/email/templates/notification/template'
import { chatMessage, chatMockRequest, chatMockResponse } from '@mock/chat.mock'

jest.useFakeTimers()
jest.mock('@service/queues/base.queue')
jest.mock('@socket/user')
jest.mock('@service/redis/user.cache')
jest.mock('@service/redis/chat.cache')
jest.mock('@service/queues/mail.queue')

Object.defineProperties(chatServer, {
  socketIOChatObject: {
    value: new Server(),
    writable: true
  }
})

describe('ChatAdd', () => {
  beforeEach(() => {
    jest.spyOn(UserCache.prototype, 'getUser').mockResolvedValue(existingUser)
    jest.restoreAllMocks()
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.clearAllTimers()
  })

  it('should call socket.io emit twice', async () => {
    jest.spyOn(chatServer.socketIOChatObject, 'emit')
    const req: Request = chatMockRequest({}, chatMessage, authUserPayload) as Request
    const res: Response = chatMockResponse()

    await ChatAdd.prototype.message(req, res)
    expect(chatServer.socketIOChatObject.emit).toHaveBeenCalledTimes(2)
  })

  it('should call addMailJob method', async () => {
    existingUserTwo.notifications.messages = true
    const req: Request = chatMockRequest({}, chatMessage, authUserPayload) as Request
    const res: Response = chatMockResponse()
    jest.spyOn(UserCache.prototype, 'getUser').mockResolvedValue(existingUserTwo)
    jest.spyOn(mailQueue, 'addMailJob')

    const templateParams = {
      username: existingUserTwo.username!,
      message: chatMessage.body,
      header: `Message notification from ${req.currentUser!.username}`
    }
    const template: string = notification.render(templateParams)

    await ChatAdd.prototype.message(req, res)
    expect(mailQueue.addMailJob).toHaveBeenCalledWith('directMessageEmail', {
      receiverEmail: existingUserTwo.email!,
      template,
      subject: `You've received messages from ${req.currentUser!.username!}`
    })
  })

  it('should not call addMailJob method', async () => {
    chatMessage.isRead = true
    const req: Request = chatMockRequest({}, chatMessage, authUserPayload) as Request
    const res: Response = chatMockResponse()
    jest.spyOn(mailQueue, 'addMailJob')

    const templateParams = {
      username: existingUserTwo.username!,
      message: chatMessage.body,
      header: `Message Notification from ${req.currentUser!.username}`
    }
    const template: string = notification.render(templateParams)

    await ChatAdd.prototype.message(req, res)
    expect(mailQueue.addMailJob).not.toHaveBeenCalledWith('directMessageMail', {
      receiverEmail: req.currentUser!.email,
      template,
      subject: `You've received messages from ${existingUserTwo.username!}`
    })
  })

  it('should call addChatList twice', async () => {
    jest.spyOn(ChatCache.prototype, 'addChatList')
    const req: Request = chatMockRequest({}, chatMessage, authUserPayload) as Request
    const res: Response = chatMockResponse()

    await ChatAdd.prototype.message(req, res)
    expect(ChatCache.prototype.addChatList).toHaveBeenCalledTimes(2)
  })

  it('should call addChatMessage', async () => {
    jest.spyOn(ChatCache.prototype, 'addChatMessage')
    const req: Request = chatMockRequest({}, chatMessage, authUserPayload) as Request
    const res: Response = chatMockResponse()

    await ChatAdd.prototype.message(req, res)
    expect(ChatCache.prototype.addChatMessage).toHaveBeenCalledTimes(1)
  })

  it('should call chatQueue addChatJob', async () => {
    jest.spyOn(chatQueue, 'addChatJob')
    const req: Request = chatMockRequest({}, chatMessage, authUserPayload) as Request
    const res: Response = chatMockResponse()

    await ChatAdd.prototype.message(req, res)
    expect(chatQueue.addChatJob).toHaveBeenCalledTimes(1)
  })

  it('should send correct json response', async () => {
    const req: Request = chatMockRequest({}, chatMessage, authUserPayload) as Request
    const res: Response = chatMockResponse()

    await ChatAdd.prototype.message(req, res)
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({
      message: 'Add chat message successful',
      conversationId: new ObjectId(`${chatMessage.conversationId}`)
    })
  })
})

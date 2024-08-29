import { Request, Response } from 'express'
import { authUserPayload } from '@mock/auth.mock'
import {
  notificationData,
  notificationMockRequest,
  notificationMockResponse
} from '@mock/notification.mock'
import { NotificationGet } from '@notification/controllers/notification-get'
import { notification } from '@service/db/notification.service'

jest.useFakeTimers()
jest.mock('@service/queues/base.queue')
jest.mock('@service/db/notification.service')

describe('Get', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.clearAllTimers()
  })

  it('should send correct json response', async () => {
    const req: Request = notificationMockRequest({}, authUserPayload, {
      notificationId: '12345'
    }) as Request
    const res: Response = notificationMockResponse()
    jest.spyOn(notification, 'getNotifications').mockResolvedValue([notificationData])

    await NotificationGet.prototype.many(req, res)
    expect(notification.getNotifications).toHaveBeenCalledWith(req.currentUser!.userId)
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({
      message: 'Get notifications successful',
      notifications: [notificationData]
    })
  })
})

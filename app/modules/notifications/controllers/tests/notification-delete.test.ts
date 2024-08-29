import { Server } from 'socket.io'
import { Request, Response } from 'express'

import { authUserPayload } from '@mock/auth.mock'
import * as notificationServer from '@socket/notification'
import { notificationQueue } from '@service/queues/notification.queue'
import { NotificationDelete } from '@notification/controllers/notification-delete'
import { notificationMockRequest, notificationMockResponse } from '@mock/notification.mock'

jest.useFakeTimers()
jest.mock('@service/queues/base.queue')

Object.defineProperties(notificationServer, {
  socketIONotificationObject: {
    value: new Server(),
    writable: true
  }
})

describe('Delete', () => {
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
    jest.spyOn(notificationServer.socketIONotificationObject, 'emit')
    jest.spyOn(notificationQueue, 'addNotificationJob')

    await NotificationDelete.prototype.init(req, res)
    expect(notificationServer.socketIONotificationObject.emit).toHaveBeenCalledWith(
      'delete notification',
      req.params.notificationId
    )
    expect(notificationQueue.addNotificationJob).toHaveBeenCalledWith('deleteNotification', {
      key: req.params.notificationId
    })
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({
      message: 'Notification delete successful'
    })
  })
})

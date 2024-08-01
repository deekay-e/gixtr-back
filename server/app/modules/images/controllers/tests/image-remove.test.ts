import { Server } from 'socket.io'
import { Request, Response } from 'express'

import * as imageServer from '@socket/image'
import { authUserPayload } from '@mock/auth.mock'
import { image } from '@service/db/image.service'
import { UserCache } from '@service/redis/user.cache'
import { imageQueue } from '@service/queues/image.queue'
import { ImageRemove } from '@image/controllers/image-remove'
import { fileDocumentMock, imagesMockRequest, imagesMockResponse } from '@mock/image.mock'

jest.useFakeTimers()
jest.mock('@service/queues/base.queue')
jest.mock('@service/redis/user.cache')

Object.defineProperties(imageServer, {
  socketIOImageObject: {
    value: new Server(),
    writable: true
  }
})

describe('ImageRemove', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.clearAllTimers()
  })

  it('should send correct json response for image upload', async () => {
    const req: Request = imagesMockRequest({}, {}, authUserPayload, { imageId: '12345' }) as Request
    const res: Response = imagesMockResponse()
    jest.spyOn(imageServer.socketIOImageObject, 'emit')
    jest.spyOn(imageQueue, 'addImageJob')

    await ImageRemove.prototype.init(req, res)
    expect(imageServer.socketIOImageObject.emit).toHaveBeenCalledWith(
      'removee image',
      req.params.imageId
    )
    expect(imageQueue.addImageJob).toHaveBeenCalledWith('removeImage', {
      imageId: req.params.imageId
    })
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({
      message: 'Remove image successful'
    })
  })

  it('should send correct json response for background image upload', async () => {
    const req: Request = imagesMockRequest({}, {}, authUserPayload, {
      bgImageId: '12345'
    }) as Request
    const res: Response = imagesMockResponse()
    jest.spyOn(imageServer.socketIOImageObject, 'emit')
    jest.spyOn(imageQueue, 'addImageJob')
    jest.spyOn(image, 'getBackgroundPicture').mockResolvedValue(fileDocumentMock)
    jest.spyOn(UserCache.prototype, 'updateUserProp')

    await ImageRemove.prototype.init(req, res)
    expect(imageServer.socketIOImageObject.emit).toHaveBeenCalledWith(
      'delete image',
      req.params.imageId
    )
    expect(imageQueue.addImageJob).toHaveBeenCalledWith('removeImage', {
      imageId: req.params.imageId
    })
    expect(UserCache.prototype.updateUserProp).toHaveBeenCalledWith(
      `${req.currentUser?.userId}`,
      'bgImageVersion',
      ''
    )
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({
      message: 'Remove image successful'
    })
  })
})

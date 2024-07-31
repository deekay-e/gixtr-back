import { Request, Response } from 'express'

import { authUserPayload } from '@mock/auth.mock'
import { image } from '@service/db/image.service'
import { ImageGet } from '@image/controllers/image-get'
import { fileDocumentMock, imagesMockRequest, imagesMockResponse } from '@mock/image.mock'

jest.useFakeTimers()

describe('ImageGet', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.clearAllTimers()
  })

  it('should send correct json response', async () => {
    const req: Request = imagesMockRequest({}, {}, authUserPayload, { imageId: '12345' }) as Request
    const res: Response = imagesMockResponse()
    jest.spyOn(image, 'getImages').mockResolvedValue([fileDocumentMock])

    await ImageGet.prototype.many(req, res)
    expect(image.getImages).toHaveBeenCalledWith(req.params.userId)
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({
      message: 'Get images successful',
      images: [fileDocumentMock]
    })
  })

  it('should send correct json response', async () => {
    const req: Request = imagesMockRequest({}, {}, authUserPayload, { imageId: '12345' }) as Request
    const res: Response = imagesMockResponse()
    jest.spyOn(image, 'getBackgroundPicture').mockResolvedValue(fileDocumentMock)

    await ImageGet.prototype.many(req, res)
    expect(image.getBackgroundPicture).toHaveBeenCalledWith(req.params.imageId)
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({
      message: 'Get background picture successful',
      image: fileDocumentMock
    })
  })
})

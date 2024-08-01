import { Server } from 'socket.io'
import { Request, Response } from 'express'

import * as imageServer from '@socket/image'
import { existingUser } from '@mock/user.mock'
import { authUserPayload } from '@mock/auth.mock'
import { UserCache } from '@service/redis/user.cache'
import { ImageAdd } from '@image/controllers/image-add'
import { imageQueue } from '@service/queues/image.queue'
import { CustomError } from '@global/helpers/error-handler'
import * as cloudinaryUploads from '@global/helpers/cloudinary-upload'
import { imagesMockRequest, imagesMockResponse } from '@mock/image.mock'

jest.useFakeTimers()
jest.mock('@service/queues/base.queue')
jest.mock('@service/redis/user.cache')
jest.mock('@socket/user')
jest.mock('@global/helpers/cloudinary-upload')

Object.defineProperties(imageServer, {
  socketIOImageObject: {
    value: new Server(),
    writable: true
  }
})

describe('ImageAdd', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.clearAllTimers()
  })

  describe('profileImage', () => {
    it('should call image upload method', async () => {
      const req: Request = imagesMockRequest({}, { image: 'testing' }, authUserPayload) as Request
      const res: Response = imagesMockResponse()
      jest
        .spyOn(cloudinaryUploads, 'uploads')
        .mockImplementation((): any => Promise.resolve({ version: '1234', public_id: '123456' }))

      await ImageAdd.prototype.profilePicture(req, res)
      expect(cloudinaryUploads.uploads).toHaveBeenCalledWith(
        req.body.image,
        req.currentUser?.userId,
        true,
        true
      )
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        message: 'Add profile picture successful'
      })
    })

    it('should call updateUserProp method', async () => {
      const req: Request = imagesMockRequest({}, { image: 'testing' }, authUserPayload) as Request
      const res: Response = imagesMockResponse()
      jest.spyOn(UserCache.prototype, 'updateUserProp').mockResolvedValue(existingUser)
      jest.spyOn(imageServer.socketIOImageObject, 'emit')
      jest
        .spyOn(cloudinaryUploads, 'uploads')
        .mockImplementation((): any => Promise.resolve({ version: '1234', public_id: '123456' }))

      const url = 'https://res.cloudinary.com/dyamr9ym3/image/upload/v1234/123456'

      await ImageAdd.prototype.profilePicture(req, res)
      expect(UserCache.prototype.updateUserProp).toHaveBeenCalledWith(
        `${req.currentUser?.userId}`,
        'profilePicture',
        url
      )
      expect(imageServer.socketIOImageObject.emit).toHaveBeenCalledWith('update user', existingUser)
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        message: 'Add profile picture successful'
      })
    })

    it('should call addImageJob method', async () => {
      const req: Request = imagesMockRequest({}, { image: 'testing' }, authUserPayload) as Request
      const res: Response = imagesMockResponse()
      jest
        .spyOn(cloudinaryUploads, 'uploads')
        .mockImplementation((): any => Promise.resolve({ version: '1234', public_id: '123456' }))
      jest.spyOn(imageQueue, 'addImageJob')

      await ImageAdd.prototype.profilePicture(req, res)
      expect(imageQueue.addImageJob).toHaveBeenCalledWith('addUserProfileImageToDB', {
        key: `${req.currentUser?.userId}`,
        value: 'https://res.cloudinary.com/dyamr9ym3/image/upload/v1234/123456',
        imgId: '123456',
        imgVersion: '1234'
      })
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        message: 'Add profile picture successful'
      })
    })
  })

  describe('backgroundImage', () => {
    it('should upload new image', async () => {
      const req: Request = imagesMockRequest(
        {},
        { image: 'data:text/plainbase64,SGVsbG8sIFdvcmxkIQ==' },
        authUserPayload
      ) as Request
      const res: Response = imagesMockResponse()
      jest
        .spyOn(cloudinaryUploads, 'uploads')
        .mockImplementation((): any => Promise.resolve({ version: '2467', public_id: '987654' }))

      await ImageAdd.prototype.backgroundPicture(req, res)
      expect(cloudinaryUploads.uploads).toHaveBeenCalledWith(req.body.image)
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        message: 'Add background picture successful'
      })
    })

    it('should not upload existing image', async () => {
      const req: Request = imagesMockRequest(
        {},
        { image: 'https://res.cloudinary.com/dyamr9ym3/image/upload/v1234/123456' },
        authUserPayload
      ) as Request
      const res: Response = imagesMockResponse()
      jest.spyOn(cloudinaryUploads, 'uploads')

      await ImageAdd.prototype.backgroundPicture(req, res)
      expect(cloudinaryUploads.uploads).not.toHaveBeenCalledWith(req.body.image)
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        message: 'Add background picture successful'
      })
    })

    it('should return bad request error', async () => {
      const req: Request = imagesMockRequest(
        {},
        { image: 'data:text/plainbase64,SGVsbG8sIFdvcmxkIQ==' },
        authUserPayload
      ) as Request
      const res: Response = imagesMockResponse()
      jest
        .spyOn(cloudinaryUploads, 'uploads')
        .mockImplementation((): any =>
          Promise.resolve({ version: '', public_id: '', message: 'Upload error' })
        )

      ImageAdd.prototype.backgroundPicture(req, res).catch((error: CustomError) => {
        expect(error.statusCode).toEqual(400)
        expect(error.serializeErrors().message).toEqual('Upload error')
      })
    })

    it('should call updateUserProp method', async () => {
      const req: Request = imagesMockRequest(
        {},
        { image: 'data:text/plainbase64,SGVsbG8sIFdvcmxkIQ==' },
        authUserPayload
      ) as Request
      const res: Response = imagesMockResponse()
      jest.spyOn(UserCache.prototype, 'updateUserProp').mockResolvedValue(existingUser)
      jest.spyOn(imageServer.socketIOImageObject, 'emit')
      jest
        .spyOn(cloudinaryUploads, 'uploads')
        .mockImplementation((): any => Promise.resolve({ version: '1234', public_id: '123456' }))

      await ImageAdd.prototype.backgroundPicture(req, res)
      expect(UserCache.prototype.updateUserProp).toHaveBeenCalledWith(
        `${req.currentUser!.userId}`,
        'bgImageId',
        '123456'
      )
      expect(UserCache.prototype.updateUserProp).toHaveBeenCalledWith(
        `${req.currentUser!.userId}`,
        'bgImageVersion',
        '1234'
      )
      expect(imageServer.socketIOImageObject.emit).toHaveBeenCalledWith('update user', {
        bgImageId: '123456',
        bgImageVersion: '1234',
        userId: existingUser
      })
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        message: 'Add background picture successful'
      })
    })

    it('should call addImageJob method', async () => {
      const req: Request = imagesMockRequest(
        {},
        { image: 'data:text/plainbase64,SGVsbG8sIFdvcmxkIQ==' },
        authUserPayload
      ) as Request
      const res: Response = imagesMockResponse()
      jest
        .spyOn(cloudinaryUploads, 'uploads')
        .mockImplementation((): any => Promise.resolve({ version: '1234', public_id: '123456' }))
      jest.spyOn(imageQueue, 'addImageJob')

      await ImageAdd.prototype.backgroundPicture(req, res)
      expect(imageQueue.addImageJob).toHaveBeenCalledWith('addBackgroundPicture', {
        key: `${req.currentUser?.userId}`,
        imgId: '123456',
        imgVersion: '1234'
      })
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        message: 'Add background picture successful'
      })
    })
  })
})

import { Server } from 'socket.io'
import { Request, Response } from 'express'

import * as postServer from '@socket/post'
import { authUserPayload } from '@mock/auth.mock'
import { PostCache } from '@service/redis/post.cache'
import { postQueue } from '@service/queues/post.queue'
import { PostCreate } from '@post/controllers/post-create'
import { CustomError } from '@global/helpers/error-handler'
import * as cloudinaryUploads from '@global/helpers/cloudinary-upload'
import { post, postMockRequest, postMockResponse } from '@mock/post.mock'

jest.useFakeTimers()
jest.mock('@service/queues/base.queue')
jest.mock('@service/redis/post.cache')
jest.mock('@global/helpers/cloudinary-upload')

Object.defineProperties(postServer, {
  socketIOPostObject: {
    value: new Server(),
    writable: true
  }
})

describe('PostCreate', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.clearAllTimers()
  })

  describe('post', () => {
    it('should send correct json response', async () => {
      const req: Request = postMockRequest(post, authUserPayload) as Request
      const res: Response = postMockResponse()
      jest.spyOn(postServer.socketIOPostObject, 'emit')
      const spy = jest.spyOn(PostCache.prototype, 'addPost')
      jest.spyOn(postQueue, 'addPostJob')

      await PostCreate.prototype.minusImage(req, res)
      const newPost = spy.mock.calls[0][0].newPost
      expect(postServer.socketIOPostObject.emit).toHaveBeenCalledWith('add post', newPost)
      expect(PostCache.prototype.addPost).toHaveBeenCalledWith({
        key: spy.mock.calls[0][0].key,
        currentUserId: `${req.currentUser?.userId}`,
        uId: `${req.currentUser?.uId}`,
        newPost
      })
      expect(postQueue.addPostJob).toHaveBeenCalledWith('addToPost', {
        key: req.currentUser?.userId,
        value: newPost
      })
      expect(res.status).toHaveBeenCalledWith(201)
      expect(res.json).toHaveBeenCalledWith({
        message: 'Create post successful'
      })
    })
  })

  describe('postWithImage', () => {
    it('should throw an error if image is not available', () => {
      delete post.image
      const req: Request = postMockRequest(post, authUserPayload) as Request
      const res: Response = postMockResponse()

      PostCreate.prototype.plusImage(req, res).catch((error: CustomError) => {
        expect(error.statusCode).toEqual(400)
        expect(error.serializeErrors().message).toEqual('Image is a required field')
      })
    })

    it('should throw an upload error', () => {
      post.image = 'data:text/plainbase64,SGVsbG8sIFdvcmxkIQ=='
      const req: Request = postMockRequest(post, authUserPayload) as Request
      const res: Response = postMockResponse()
      jest
        .spyOn(cloudinaryUploads, 'uploads')
        .mockImplementation((): any =>
          Promise.resolve({ version: '', public_id: '', message: 'Upload error' })
        )

      PostCreate.prototype.plusImage(req, res).catch((error: CustomError) => {
        expect(error.statusCode).toEqual(400)
        expect(error.serializeErrors().message).toEqual('Upload error')
      })
    })

    it('should send correct json response', async () => {
      post.image = 'testing image'
      const req: Request = postMockRequest(post, authUserPayload) as Request
      const res: Response = postMockResponse()
      jest.spyOn(postServer.socketIOPostObject, 'emit')
      const spy = jest.spyOn(PostCache.prototype, 'addPost')
      jest.spyOn(postQueue, 'addPostJob')
      jest
        .spyOn(cloudinaryUploads, 'uploads')
        .mockImplementation((): any => Promise.resolve({ version: '1234', public_id: '123456' }))

      await PostCreate.prototype.plusImage(req, res)
      const newPost = spy.mock.calls[0][0].newPost
      expect(postServer.socketIOPostObject.emit).toHaveBeenCalledWith('add post', newPost)
      expect(PostCache.prototype.addPost).toHaveBeenCalledWith({
        key: spy.mock.calls[0][0].key,
        currentUserId: `${req.currentUser?.userId}`,
        uId: `${req.currentUser?.uId}`,
        newPost
      })
      expect(postQueue.addPostJob).toHaveBeenCalledWith('addToPost', {
        key: req.currentUser?.userId,
        value: newPost
      })
      expect(res.status).toHaveBeenCalledWith(201)
      expect(res.json).toHaveBeenCalledWith({
        message: 'Create post with image successful'
      })
    })
  })
})

import { Request, Response } from 'express'
import { Server } from 'socket.io'

import * as postServer from '@socket/post'
import { authUserPayload } from '@mock/auth.mock'
import { PostCache } from '@service/redis/post.cache'
import { postQueue } from '@service/queues/post.queue'
import { PostDelete } from '@post/controllers/post-delete'
import { post, postMockRequest, postMockResponse } from '@mock/post.mock'

jest.useFakeTimers()
jest.mock('@service/queues/base.queue')
jest.mock('@service/redis/post.cache')

Object.defineProperties(postServer, {
  socketIOPostObject: {
    value: new Server(),
    writable: true
  }
})

describe('PostDelete', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.clearAllTimers()
  })

  it('should send correct json response', async () => {
    const req: Request = postMockRequest(post, authUserPayload, { postId: '12345' }) as Request
    const res: Response = postMockResponse()
    const postId = req.params.postId
    const userId = `${req.currentUser?.userId}`

    jest.spyOn(postServer.socketIOPostObject, 'emit')
    jest.spyOn(PostCache.prototype, 'deletePost')
    jest.spyOn(postQueue, 'addPostJob')

    await PostDelete.prototype.remove(req, res)

    // test expectations
    expect(postServer.socketIOPostObject.emit).toHaveBeenCalledWith('deletePost', postId)
    expect(PostCache.prototype.deletePost).toHaveBeenCalledWith(postId, userId)
    expect(postQueue.addPostJob).toHaveBeenCalledWith('deletePost', { keyOne: postId, keyTwo: userId })
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({
      message: 'Delete post successful'
    })
  })
})

import { Request, Response } from 'express'

import { existingUser } from '@mock/user.mock'
import { authUserPayload } from '@mock/auth.mock'
import { CommentCache } from '@service/redis/comment.cache'
import { commentQueue } from '@service/queues/comment.queue'
import { CommentAdd } from '@comment/controllers/comment-add'
import { reactionMockRequest, reactionMockResponse } from '@mock/reaction.mock'

jest.useFakeTimers()
jest.mock('@service/queues/base.queue')
jest.mock('@service/redis/comment.cache')

describe('CommentAdd', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.clearAllTimers()
  })

  it('should call addComment and addCommentJob methods', async () => {
    const req: Request = reactionMockRequest(
      {},
      {
        postId: '6027f77087c9d9ccb1555268',
        comment: 'This is a comment',
        profilePicture: 'https://place-hold.it/500x500',
        userTo: `${existingUser._id}`
      },
      authUserPayload
    ) as Request
    const res: Response = reactionMockResponse()
    jest.spyOn(CommentCache.prototype, 'addComment')
    jest.spyOn(commentQueue, 'addCommentJob')

    await CommentAdd.prototype.init(req, res)
    expect(CommentCache.prototype.addComment).toHaveBeenCalled()
    expect(commentQueue.addCommentJob).toHaveBeenCalled()
  })

  it('should send correct json response', async () => {
    const req: Request = reactionMockRequest(
      {},
      {
        postId: '6027f77087c9d9ccb1555268',
        comment: 'This is a comment',
        profilePicture: 'https://place-hold.it/500x500',
        userTo: `${existingUser._id}`
      },
      authUserPayload
    ) as Request
    const res: Response = reactionMockResponse()

    await CommentAdd.prototype.init(req, res)
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({
      message: 'Create comment successful'
    })
  })
})

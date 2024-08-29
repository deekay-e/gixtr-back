import { Request, Response } from 'express'

import { authUserPayload } from '@mock/auth.mock'
import { ReactionCache } from '@service/redis/reaction.cache'
import { reactionQueue } from '@service/queues/reaction.queue'
import { ReactionRemove } from '@reaction/controllers/reaction-remove'
import { reactionMockRequest, reactionMockResponse } from '@mock/reaction.mock'

jest.useFakeTimers()
jest.mock('@service/queues/base.queue')
jest.mock('@service/redis/reaction.cache')

describe('ReactionRemove', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.clearAllTimers()
  })

  it('should send correct json response', async () => {
    const req: Request = reactionMockRequest({}, {}, authUserPayload, {
      postId: '6027f77087c9d9ccb1555268',
      prevReaction: 'like',
      postReactions: JSON.stringify({
        sad: 0,
        wow: 0,
        like: 1,
        love: 0,
        angry: 0,
        happy: 0
      })
    }) as Request
    const res: Response = reactionMockResponse()
    jest.spyOn(ReactionCache.prototype, 'removeReaction')
    const spy = jest.spyOn(reactionQueue, 'addReactionJob')

    await ReactionRemove.prototype.init(req, res)
    expect(ReactionCache.prototype.removeReaction).toHaveBeenCalledWith(
      '6027f77087c9d9ccb1555268',
      `${req.currentUser?.username}`,
      JSON.parse(req.params.postReactions)
    )
    expect(reactionQueue.addReactionJob).toHaveBeenCalledWith(
      spy.mock.calls[0][0],
      spy.mock.calls[0][1]
    )
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({ message: 'Remove reaction successful' })
  })
})

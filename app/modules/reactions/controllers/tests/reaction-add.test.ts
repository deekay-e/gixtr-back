import { Request, Response } from 'express'

import { authUserPayload } from '@mock/auth.mock'
import { ReactionCache } from '@service/redis/reaction.cache'
import { reactionQueue } from '@service/queues/reaction.queue'
import { ReactionAdd } from '@reaction/controllers/reaction-add'
import { reactionMockRequest, reactionMockResponse } from '@mock/reaction.mock'

jest.useFakeTimers()
jest.mock('@service/queues/base.queue')
jest.mock('@service/redis/reaction.cache')

describe('AddReaction', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.clearAllTimers()
  })

  it('should send correct json response', async () => {
    const req: Request = reactionMockRequest(
      {},
      {
        postId: '6027f77087c9d9ccb1555268',
        prevReaction: 'love',
        profilePicture: 'http://place-hold.it/500x500',
        userTo: '60263f14648fed5246e322d9',
        type: 'like',
        postReactions: {
          like: 1,
          love: 0,
          happy: 0,
          wow: 0,
          sad: 0,
          angry: 0
        }
      },
      authUserPayload
    ) as Request
    const res: Response = reactionMockResponse()
    const spy = jest.spyOn(ReactionCache.prototype, 'addReaction')
    const reactionSpy = jest.spyOn(reactionQueue, 'addReactionJob')

    await ReactionAdd.prototype.init(req, res)
    expect(ReactionCache.prototype.addReaction).toHaveBeenCalledWith(
      spy.mock.calls[0][0],
      spy.mock.calls[0][1],
      spy.mock.calls[0][2],
      spy.mock.calls[0][3],
      spy.mock.calls[0][4]
    )
    expect(reactionQueue.addReactionJob).toHaveBeenCalledWith(
      reactionSpy.mock.calls[0][0],
      reactionSpy.mock.calls[0][1]
    )
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({ message: 'Add reaction successful' })
  })
})

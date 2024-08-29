import { Request, Response } from 'express'
import HTTP_STATUS from 'http-status-codes'

import { UserBlockCache } from '@service/redis/user-block.cache'
import { IBlockedUserJob } from '@follower/interfaces/follower.interface'
import { userBlockQueue } from '@service/queues/user-block.queue'

const userBlockCache: UserBlockCache = new UserBlockCache()

export class UserBlock {
  public async block(req: Request, res: Response): Promise<void> {
    const type: string = 'block'
    const { followeeId } = req.params
    const userId = req.currentUser!.userId

    const blocked: IBlockedUserJob = { type, userId, followeeId }
    const blockedBy: IBlockedUserJob = { type, userId: followeeId, followeeId: userId }

    // block user in redis
    await Promise.all([
      userBlockCache.update(blocked, 'blocked'),
      userBlockCache.update(blockedBy, 'blockedBy')
    ])

    // block user in database
    userBlockQueue.addUserBlockJob('blockUser', blocked)

    res.status(HTTP_STATUS.OK).json({ message: 'Block user successful' })
  }

  public async unblock(req: Request, res: Response): Promise<void> {
    const type: string = 'unblock'
    const { followeeId } = req.params
    const userId = req.currentUser!.userId

    const blocked: IBlockedUserJob = { type, userId, followeeId }
    const blockedBy: IBlockedUserJob = { type, userId: followeeId, followeeId: userId }

    // block user in redis
    await Promise.all([
      userBlockCache.update(blocked, 'blocked'),
      userBlockCache.update(blockedBy, 'blockedBy')
    ])

    // block user in database
    userBlockQueue.addUserBlockJob('unblockUser', blocked)

    res.status(HTTP_STATUS.OK).json({ message: 'Unblock user successful' })
  }
}

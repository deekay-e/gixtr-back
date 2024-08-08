import { Request, Response } from 'express'
import HTTP_STATUS from 'http-status-codes'

import { UserCache } from '@service/redis/user.cache'
import { userService } from '@service/db/user.service'
import { FollowCache } from '@service/redis/follow.cache'
import { IUserDocument } from '@user/interfaces/user.interface'
import { IFollowerData } from '@follower/interfaces/follower.interface'
import { followService } from '@service/db/follow.service'

const userCache: UserCache = new UserCache()
const followCache: FollowCache = new FollowCache()
const PAGE_SIZE = 12

export class UserGet {
  public async profiles(req: Request, res: Response): Promise<void> {
    const { page } = req.params
    const userId = req.currentUser!.userId
    const skip: number = (parseInt(page) - 1) * PAGE_SIZE
    const limit: number = PAGE_SIZE * parseInt(page)
    const start: number = skip === 0 ? skip : skip + 1
    const cachedUsers: IUserDocument[] = await userCache.getUsers('user', start, limit)
    const users: IUserDocument[] = cachedUsers.length
      ? cachedUsers
      : await userService.getUsers(userId, skip, limit)
    const cacheFollowers: IFollowerData[] = await followCache.getFollows(userId)
    const followers: IFollowerData[] = cacheFollowers.length
      ? cacheFollowers
      : await followService.getFollowees(userId)

    res
      .status(HTTP_STATUS.OK)
      .json({ message: 'Get user profiles successful', users, count: users.length, followers })
  }
}

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

export class FollowGet {
  public async one(req: Request, res: Response): Promise<void> {
    const { followeeId } = req.params

    // get followee from redis
    const user: IUserDocument = (await userCache.getUser(followeeId)) as IUserDocument

    // get followee from the database if it doesn't exist in redis
    const followee = user ? user : await userService.getUserById(followeeId)

    res.status(HTTP_STATUS.OK).json({ message: `Get follower successful`, followee })
  }

  public async followers(req: Request, res: Response): Promise<void> {
    const { userId } = req.params
    const user = userId && userId !== '' ? userId : req.currentUser!.userId

    // get follower from redis
    const users: IFollowerData[] = await followCache.getFollows(`followers:${user}`)

    // get follower from the database if it doesn't exist in redis
    const followers: IFollowerData[] = users.length
      ? users
      : await followService.getFollowers(user)

    res.status(HTTP_STATUS.OK).json({ message: `Get user followers successful`, followers })
  }

  public async followees(req: Request, res: Response): Promise<void> {
    const { userId } = req.params
    const user = userId && userId !== '' ? userId : req.currentUser!.userId

    // get followee from redis
    const users: IFollowerData[] = await followCache.getFollows(`following:${user}`)

    // get followee from the database if it doesn't exist in redis
    const followees: IFollowerData[] = users.length
      ? users
      : await followService.getFollowees(user)

    res.status(HTTP_STATUS.OK).json({ message: `Get user following successful`, followees })
  }
}

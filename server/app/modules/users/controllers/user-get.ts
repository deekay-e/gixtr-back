import { Request, Response } from 'express'
import HTTP_STATUS from 'http-status-codes'

import { Utils } from '@global/helpers/utils'
import { PostCache } from '@service/redis/post.cache'
import { UserCache } from '@service/redis/user.cache'
import { userService } from '@service/db/user.service'
import { postService } from '@service/db/post.service'
import { FollowCache } from '@service/redis/follow.cache'
import { followService } from '@service/db/follow.service'
import { IPostDocument } from '@post/interfaces/post.interface'
import { IUserDocument } from '@user/interfaces/user.interface'
import { IFollowerData } from '@follower/interfaces/follower.interface'

const postCache: PostCache = new PostCache()
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
    const cachedUsers: IUserDocument[] = await userCache.getUsers(userId, start, limit)
    const users: IUserDocument[] = cachedUsers.length
      ? cachedUsers
      : await userService.getUsers(userId, skip, limit)
    const cachedUserCount: number = await userCache.getUsersCount()
    const count: number = cachedUserCount ? cachedUserCount : await userService.getUsersCount()
    const cacheFollowers: IFollowerData[] = await followCache.getFollows(`followers:${userId}`)
    const followers: IFollowerData[] = cacheFollowers.length
      ? cacheFollowers
      : await followService.getFollowers(userId)

    res
      .status(HTTP_STATUS.OK)
      .json({ message: 'Get user profiles successful', users, count, followers })
  }

  public async profile(req: Request, res: Response): Promise<void> {
    const { id } = req.params
    const userId = id ? id : req.currentUser!.userId
    const cachedUser: IUserDocument = (await userCache.getUser(userId)) as IUserDocument
    const user: IUserDocument = cachedUser ? cachedUser : await userService.getUserById(userId)

    res.status(HTTP_STATUS.OK).json({ message: 'Get user profile', user })
  }

  public async profileAndPosts(req: Request, res: Response): Promise<void> {
    let { username, page, userId, uId } = req.params
    uId = uId ? uId : req.currentUser!.uId
    userId = userId ? userId : req.currentUser!.userId
    username = username ? Utils.capitalize(username) : Utils.capitalize(req.currentUser!.username)

    const skip: number = (parseInt(page) - 1) * PAGE_SIZE
    const limit: number = PAGE_SIZE * parseInt(page)
    const cachedUser: IUserDocument = (await userCache.getUser(userId)) as IUserDocument
    const user: IUserDocument = cachedUser ? cachedUser : await userService.getUserById(userId)
    const cachedPosts: IPostDocument[] = await postCache.getUserPosts(
      'post',
      parseInt(uId, 10),
      skip,
      limit
    )
    const posts: IPostDocument[] = cachedPosts.length
      ? cachedPosts
      : await postService.getPosts({ username }, skip, limit, { createdAt: -1 })

    res
      .status(HTTP_STATUS.OK)
      .json({ message: 'Get user profile and posts successful', user, posts })
  }

  public async suggestions(req: Request, res: Response): Promise<void> {
    const userId = req.currentUser!.userId

    const randomUsers: IUserDocument[] = await userCache.getRandomUsers(userId)
    const users: IUserDocument[] = randomUsers.length
      ? randomUsers
      : await userService.getRandomUsers(userId)

    res.status(HTTP_STATUS.OK).json({ message: 'Get user suggestions successful', users })
  }
}

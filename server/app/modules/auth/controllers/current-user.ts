import { Request, Response } from 'express'
import HTTP_STATUS from 'http-status-codes'

import { UserCache } from '@service/redis/user.cache'
import { IUserDocument } from '@user/interfaces/user.interface'
import { userService } from '@service/db/user.service'

const userCache: UserCache = new UserCache()

export class CurrentUser {
  public async read(req: Request, res: Response): Promise<void> {
    let isUser = false
    let token, user = null

    const cachedUser: IUserDocument = await userCache
      .getUserFromCache(`${req.currentUser?.userId}`) as IUserDocument
    user = cachedUser ? cachedUser : await userService.getUserById(`${req.currentUser?.userId}`)
    if (Object.keys(user).length) {
      isUser = true
      token = req.session?.jwt
    }

    res.status(HTTP_STATUS.OK).json({ token, isUser, user })
  }
}

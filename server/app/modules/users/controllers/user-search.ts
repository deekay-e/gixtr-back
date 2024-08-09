import { Request, Response } from 'express'
import HTTP_STATUS from 'http-status-codes'

import { Utils } from '@global/helpers/utils'
import { userService } from '@service/db/user.service'
import { ISearchUser } from '@user/interfaces/user.interface'

export class UserSearch {
  public async init(req: Request, res: Response): Promise<void> {
    const regex = new RegExp(Utils.escapeRegex(req.params.query), 'i')
    const users: ISearchUser[] = await userService.searchUsers(regex)
    res.status(HTTP_STATUS.OK).json({ message: 'Search users successful', search: users })
  }
}

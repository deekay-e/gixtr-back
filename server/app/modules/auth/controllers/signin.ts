import { Request, Response } from 'express'
import HTTP_STATUS from 'http-status-codes'

import { Utils } from '@global/helpers/utils'
import { loginSchema } from '@auth/schemas/signin'
import { authService } from '@service/db/auth.service'
import { userService } from '@service/db/user.service'
import { IAuthDocument } from '@auth/interfaces/auth.interface'
import { IUserDocument } from '@user/interfaces/user.interface'
import { BadRequestError } from '@global/helpers/error-handler'
import { JoiValidator } from '@global/decorators/joi-validation'

export class Signin {
  @JoiValidator(loginSchema)
  public async read(req: Request, res: Response): Promise<void> {
    const { login, password } = req.body
    const email = Utils.isEmail(login) ? login : ''
    const username = !Utils.isEmail(login) ? login : ''

    const authUser: IAuthDocument = await authService.getUser(username, email)
    if (!authUser) throw new BadRequestError('Invalid login credentials')

    const isPassword: boolean = await authUser.comparePassword(password)
    if (!isPassword) throw new BadRequestError('Invalid login password')

    let user: IUserDocument = await userService.getUserByAuthId(`${authUser._id}`)
    const userJWT: string = authService.getToken(authUser, `${user._id}`)
    req.session = { jwt: userJWT }

    user = {
      ...user,
      authId: authUser._id,
      username: authUser.username,
      uId: authUser.uId,
      email: authUser.email,
      avatarColor: authUser.avatarColor,
      createdAt: authUser.createdAt
    } as IUserDocument

    res
      .status(HTTP_STATUS.OK)
      .json({ message: 'Login user successful', user: user, token: userJWT })
  }
}

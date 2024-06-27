import JWT from 'jsonwebtoken'
import { Request, Response } from 'express'
import HTTP_STATUS from 'http-status-codes'

import { config } from '@/config'
import { loginSchema } from '@auth/schemas/signin'
import { authService } from '@service/db/auth.service'
import { IAuthDocument } from '@auth/interfaces/auth.interface'
import { BadRequestError } from '@global/helpers/error-handler'
import { JoiValidator } from '@global/decorators/joi-validation'


export class Signin {
  @JoiValidator(loginSchema)
  public async  read(req: Request, res: Response): Promise<void> {
    let { username, email, password } = req.body
    if (!username || username === undefined)
      username = ''
    if (!email || email === undefined)
      email = ''

    const user: IAuthDocument = await authService.getUser(username, email)
    if (!user) throw new BadRequestError('Invalid login credentials')

    const isPassword: boolean = await user.comparePassword(password)
    if (!isPassword) throw new BadRequestError('Invalid login credentials')

    const userJWT: string = authService.getToken(user, user._id)
    req.session = { jwt: userJWT }

    res.status(HTTP_STATUS.OK)
      .json({ message: 'Login user successful', user: user, token: userJWT })
  }
}

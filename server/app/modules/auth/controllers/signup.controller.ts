import { ObjectId } from 'mongodb'
import { Request, Response } from 'express'

import { signupSchema } from '@auth/schemas/signup'
import { JoiValidator } from '@global/decorators/joi-validation'
import { authService } from '@service/db/auth.service'
import { BadRequestError } from '@global/helpers/error-handler'
import { IAuthDocument } from '@auth/interfaces/auth.interface'

export class Signup {
  @JoiValidator(signupSchema)
  public async create(req: Request, res: Response): Promise<void> {
    const { username, password, email, avatarColor, avatarImage } = req.body
    const userExists: IAuthDocument = await authService.getUser(username, email)
    if (userExists) throw new BadRequestError('User already exists')
  }
}

import { ObjectId } from 'mongodb'
import { Request, Response } from 'express'
import { UploadApiResponse } from 'cloudinary'
import HTTP_STATUS from 'http-status-codes'

import { signupSchema } from '@auth/schemas/signup'
import { JoiValidator } from '@global/decorators/joi-validation'
import { authService } from '@service/db/auth.service'
import { BadRequestError } from '@global/helpers/error-handler'
import { IAuthDocument, ISignUpData } from '@auth/interfaces/auth.interface'
import { Utils } from '@global/helpers/utils'
import { uploads } from '@global/helpers/cloudinary-upload'

export class Signup {
  @JoiValidator(signupSchema)
  public async create(req: Request, res: Response): Promise<void> {
    const { username, password, email, avatarColor, avatarImage } = req.body
    const dupUser: IAuthDocument = await authService.getUser(username, email)
    if (dupUser) throw new BadRequestError('User already exists')

    const authObjectId: ObjectId =  new ObjectId()
    const userObjectId: ObjectId =  new ObjectId()
    const uId = `${Utils.genRandomInt(16)}`
    const authData: IAuthDocument = Signup.prototype.signupData({
      _id: authObjectId,
      uId,
      username,
      email,
      password,
      avatarColor
    })
    const result: UploadApiResponse = await uploads(
      avatarImage, `${userObjectId}`, true, true
    ) as UploadApiResponse
    if (!result?.public_id)
      throw new BadRequestError('Error occurred during upload. Try again')

    res.status(HTTP_STATUS.CREATED).json({ message: 'Create user successful',
      authData
    })
  }

  private signupData(data: ISignUpData): IAuthDocument {
    const { _id, uId, username, email, password, avatarColor } = data
    return {
      _id,
      uId,
      username: Utils.capitalize(username),
      email: Utils.lowercase(email),
      password,
      avatarColor,
      createdAt: new Date()
    } as IAuthDocument
  }
}

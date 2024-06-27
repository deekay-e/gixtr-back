import { omit } from 'lodash'
import { ObjectId } from 'mongodb'
import JWT from 'jsonwebtoken'
import HTTP_STATUS from 'http-status-codes'
import { Request, Response } from 'express'
import { UploadApiResponse } from 'cloudinary'

import { Utils } from '@global/helpers/utils'
import { registerSchema } from '@auth/schemas/signup'
import { authService } from '@service/db/auth.service'
import { uploads } from '@global/helpers/cloudinary-upload'
import { IUserDocument } from '@user/interfaces/user.interface'
import { BadRequestError } from '@global/helpers/error-handler'
import { JoiValidator } from '@global/decorators/joi-validation'
import { IAuthDocument, ISignUpData } from '@auth/interfaces/auth.interface'
import { UserCache } from '@service/redis/user.cache'
import { config } from '@/config'
import { authQueue } from '@service/queues/auth.queue'

const userCache: UserCache = new UserCache()

export class Signup {
  @JoiValidator(registerSchema)
  public async create(req: Request, res: Response): Promise<void> {
    const { username, password, email, avatarColor, avatarImage } = req.body
    const dupUser: IAuthDocument = await authService.getUser(username, email)
    if (dupUser) throw new BadRequestError('User already exists')

    const authObjectId: ObjectId = new ObjectId()
    const userObjectId: ObjectId = new ObjectId()
    const uId = `${Utils.genRandomInt(16)}`
    const authData: IAuthDocument = Signup.prototype.signupData({
      _id: authObjectId,
      uId,
      username,
      email,
      password,
      avatarColor
    })
    const result: UploadApiResponse = (await uploads(
      avatarImage,
      `${userObjectId}`,
      true,
      true
    )) as UploadApiResponse
    if (!result?.public_id) throw new BadRequestError('Error occurred during upload. Try again')

    // Add user data to redis
    const userData: IUserDocument = Signup.prototype.userData(authData, userObjectId)
    userData.profilePicture =`https://res.cloudinary.com/${config.CLOUD_NAME}/image/upload/v${result.version}/${userObjectId}`
    await userCache.addUserToCache(`${userObjectId}`, uId, userData)

    // Add data to monogdb
    omit(userData, ['uId', 'username', 'email', 'avatarColor', 'password'])
    authQueue.addAuthUserJob('addToAuth', { value: userData })

    const userJWT: string = authService.getToken(authData, userObjectId)
    req.session = { jwt: userJWT }

    res.status(HTTP_STATUS.CREATED)
      .json({ message: 'Create user successful', user: authData, token: userJWT })
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

  private userData(data: IAuthDocument, userObjectId: ObjectId): IUserDocument {
    const { _id, username, email, uId, password, avatarColor } = data
    return {
      _id: userObjectId,
      authId: _id,
      uId,
      username: Utils.capitalize(username),
      email,
      password,
      avatarColor,
      profilePicture: '',
      blocked: [],
      blockedBy: [],
      work: '',
      location: '',
      school: '',
      quote: '',
      bgImageVersion: '',
      bgImageId: '',
      followersCount: 0,
      followingCount: 0,
      postsCount: 0,
      notifications: {
        messages: true,
        reactions: true,
        comments: true,
        follows: true
      },
      social: {
        facebook: '',
        instagram: '',
        twitter: '',
        youtube: ''
      }
    } as unknown as IUserDocument
  }
}

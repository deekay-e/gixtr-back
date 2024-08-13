import { omit } from 'lodash'
import { ObjectId } from 'mongodb'
import HTTP_STATUS from 'http-status-codes'
import { Request, Response } from 'express'
import { UploadApiResponse } from 'cloudinary'

import { config } from '@/config'
import { Utils } from '@global/helpers/utils'
import { UserCache } from '@service/redis/user.cache'
import { registerSchema } from '@auth/schemas/signup'
import { authService } from '@service/db/auth.service'
import { authQueue } from '@service/queues/auth.queue'
import { userQueue } from '@service/queues/user.queue'
import { uploads } from '@global/helpers/cloudinary-upload'
import { IUserDocument } from '@user/interfaces/user.interface'
import { BadRequestError } from '@global/helpers/error-handler'
import { joiValidator } from '@global/decorators/joi-validation'
import { IAuthDocument, ISignUpData } from '@auth/interfaces/auth.interface'

const CN: string = config.CLOUD_NAME!
const userCache: UserCache = new UserCache()

export class Signup {
  @joiValidator(registerSchema)
  public async create(req: Request, res: Response): Promise<void> {
    const { username, password, email, avatarColor, avatarImage, roles } = req.body
    const defaultRoles = roles.length ? roles : ['org:user']
    const dupUser: IAuthDocument = await authService.getAuthUser(username, email)
    if (dupUser) throw new BadRequestError('User already exists')

    const uId = `${Utils.genRandomInt(16)}`
    const authOId: ObjectId = new ObjectId()
    const userOId: ObjectId = new ObjectId()
    const authData: IAuthDocument = Signup.prototype.getSignupData({
      _id: authOId,
      uId,
      username,
      email,
      password,
      avatarColor,
      roles: defaultRoles
    })
    const img: UploadApiResponse = (await uploads(
      avatarImage,
      `${userOId}`,
      true,
      true
    )) as UploadApiResponse
    if (!img?.public_id) throw new BadRequestError('Error occurred during upload. Try again')

    // Add user data to redis
    const userData: IUserDocument = Signup.prototype.getUserData(authData, userOId)
    userData.profilePicture = `https://res.cloudinary.com/${CN}/image/upload/v${img.version}/${userOId}`
    await userCache.addUser(`${userOId}`, uId, userData)

    // Add data to monogdb
    const newUserData = omit(userData, ['uId', 'username', 'email', 'avatarColor', 'password'])
    authQueue.addAuthUserJob('addToAuth', { value: authData })
    userQueue.addUserJob('addToUser', { value: newUserData })

    const userJWT: string = authService.getToken(authData, `${userOId}`)
    req.session = { jwt: userJWT }

    res
      .status(HTTP_STATUS.CREATED)
      .json({ message: 'Create user successful', user: userData, token: userJWT })
  }

  private getSignupData(data: ISignUpData): IAuthDocument {
    const { _id, uId, username, email, password, avatarColor, roles } = data
    return {
      _id,
      uId,
      roles,
      username: Utils.capitalize(username),
      email: Utils.lowercase(email),
      password,
      avatarColor,
      createdAt: new Date()
    } as IAuthDocument
  }

  private getUserData(data: IAuthDocument, userOId: ObjectId): IUserDocument {
    const { _id, username, email, uId, password, avatarColor, roles } = data
    return {
      _id: userOId,
      uId,
      authId: _id,
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
      },
      roles
    } as unknown as IUserDocument
  }
}

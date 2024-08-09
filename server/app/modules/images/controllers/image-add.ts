import { Request, Response } from 'express'
import HTTP_STATUS from 'http-status-codes'
import { UploadApiResponse } from 'cloudinary'

import { config } from '@/config'
import { socketIOImageObject } from '@socket/image'
import { UserCache } from '@service/redis/user.cache'
import { imageQueue } from '@service/queues/image.queue'
import { uploads } from '@global/helpers/cloudinary-upload'
import { addImageSchema } from '@image/schemas/image.schema'
import { BadRequestError } from '@global/helpers/error-handler'
import { IUserDocument } from '@user/interfaces/user.interface'
import { joiValidator } from '@global/decorators/joi-validation'
import { IBgUploadResponse, IFileImageJob } from '@image/interfaces/image.interface'
import { Utils } from '@global/helpers/utils'

const CN: string = config.CLOUD_NAME!
const userCache: UserCache = new UserCache()

export class ImageAdd {
  @joiValidator(addImageSchema)
  public async init(req: Request, res: Response): Promise<void> {
    const { image } = req.body
    const userId = req.currentUser!.userId

    // upload image to cloudinary
    const result: UploadApiResponse = (await uploads(image)) as UploadApiResponse
    const imgId = result?.public_id
    const imgVersion = `${result.version}`
    if (!imgId) throw new BadRequestError(result.message)

    // emit socket event for image object
    socketIOImageObject.emit('add image', imgId)

    // add image data in databse
    const imageJob: IFileImageJob = { userId, imgId, imgVersion }
    imageQueue.addImageJob('addImage', imageJob)

    res.status(HTTP_STATUS.OK).json({ message: 'Add image successful' })
  }

  @joiValidator(addImageSchema)
  public async profilePicture(req: Request, res: Response): Promise<void> {
    const { image } = req.body
    const userId = req.currentUser!.userId

    // upload profile image to cloudinary
    const result: UploadApiResponse = (await uploads(
      image,
      userId,
      true,
      true
    )) as UploadApiResponse
    const imgId = result?.public_id
    const imgVersion = `${result.version}`
    if (!imgId) throw new BadRequestError(result.message)

    // update user profile picture data in redis
    const url = `https://res.cloudinary.com/${CN}/image/upload/v${imgVersion}/${userId}`
    const user = (await userCache.updateUserProp(userId, 'profilePicture', url)) as IUserDocument

    // emit socket event for image object
    socketIOImageObject.emit('update profile picture', user)

    // update image data in databse
    const imageJob: IFileImageJob = { userId, value: url, imgId, imgVersion }
    imageQueue.addImageJob('addProfilePicture', imageJob)

    res.status(HTTP_STATUS.OK).json({ message: 'Add profile picture successful' })
  }

  @joiValidator(addImageSchema)
  public async backgroundPicture(req: Request, res: Response): Promise<void> {
    const { image } = req.body
    const userId = req.currentUser!.userId

    // upload background image to cloudinary
    const { version, publicId } = await ImageAdd.prototype.backgroundUpload(image)

    // update user background picture data in redis
    const users: [IUserDocument, IUserDocument] = (await Promise.all([
      userCache.updateUserProp(userId, 'bgImageId', publicId),
      userCache.updateUserProp(userId, 'bgImageVersion', version)
    ])) as [IUserDocument, IUserDocument]

    // emit socket event for image object
    socketIOImageObject.emit('add background picture', {
      bgImageId: publicId,
      bgImageVersion: version,
      userId: users[0]
    })

    // update image data in databse
    const imageJob: IFileImageJob = { userId, imgId: publicId, imgVersion: version }
    imageQueue.addImageJob('addBackgroundPicture', imageJob)

    res.status(HTTP_STATUS.OK).json({ message: 'Add background picture successful' })
  }

  private async backgroundUpload(image: string): Promise<IBgUploadResponse> {
    const isDataURL = Utils.isDataURL(image)
    let publicId = ''
    let version = ''
    if (isDataURL) {
      const res: UploadApiResponse = (await uploads(image)) as UploadApiResponse
      if (!res.public_id) throw new BadRequestError(res.message)
      else {
        publicId = res.public_id
        version = `${res.version}`
      }
    } else {
      const value = image.split('/')
      version = value[value.length - 2]
      publicId = value[value.length - 1]
    }

    return { version: version.replace(/v/g, ''), publicId }
  }
}

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
import { JoiValidator } from '@global/decorators/joi-validation'
import { IFileImageJob } from '@image/interfaces/image.interface'

const CN: string = config.CLOUD_NAME!
const userCache: UserCache = new UserCache()

export class ImageAdd {
  @JoiValidator(addImageSchema)
  public async init(req: Request, res: Response): Promise<void> {
    const { image } = req.body
    const userId = req.currentUser!.userId

    // upload post image to cloudinary
    const result: UploadApiResponse = (await uploads(
      image,
      userId,
      true,
      true
    )) as UploadApiResponse
    const imgId = result?.public_id
    const imgVersion = `${result.version}`
    if (!imgId) throw new BadRequestError(result.message)

    // emit socket event for image object
    socketIOImageObject.emit('add image', imgId)

    // update image data in databse
    const imageJob: IFileImageJob = { userId, imgId, imgVersion }
    imageQueue.addImageJob('updateImage', imageJob)

    res.status(HTTP_STATUS.OK).json({ message: 'Add image successful' })
  }

  @JoiValidator(addImageSchema)
  public async profilePicture(req: Request, res: Response): Promise<void> {
    const { image } = req.body
    const userId = req.currentUser!.userId

    // upload post image to cloudinary
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
    const user = await userCache.updateUserProp(userId, 'profilePicture', url) as IUserDocument

    // emit socket event for image object
    socketIOImageObject.emit('update profile picture', user)

    // update image data in databse
    const imageJob: IFileImageJob = { userId, value: url, imgId, imgVersion }
    imageQueue.addImageJob('addProfilePicture', imageJob)

    res.status(HTTP_STATUS.OK).json({ message: 'Add profile picture successful' })
  }

  @JoiValidator(addImageSchema)
  public async backgroundPicture(req: Request, res: Response): Promise<void> {
    const { image } = req.body
    const userId = req.currentUser!.userId

    // upload post image to cloudinary
    const result: UploadApiResponse = (await uploads(
      image,
      userId,
      true,
      true
    )) as UploadApiResponse
    const imgId = result?.public_id
    const imgVersion = `${result.version}`
    if (!imgId) throw new BadRequestError(result.message)

    // emit socket event for image object
    socketIOImageObject.emit('add background picture', imgId)

    // update user background picture data in redis
    await userCache.updateUserProp(userId, 'bgImageId', imgId)
    await userCache.updateUserProp(userId, 'bgImageVersion', imgVersion)

    // update image data in databse
    const imageJob: IFileImageJob = { userId, imgId, imgVersion }
    imageQueue.addImageJob('addBackgroundPicture', imageJob)

    res.status(HTTP_STATUS.OK).json({ message: 'Add background picture successful' })
  }
}

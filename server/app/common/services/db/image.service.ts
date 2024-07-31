import { ObjectId } from 'mongodb'

import { UserModel } from '@user/models/user.model'
import { ImageModel } from '@image/models/image.model'
import { IFileImageDocument, IFileImageJob } from '@image/interfaces/image.interface'

class ImageService {
  /**
   * addProfilePicture
   */
  public async addProfilePicture(image: IFileImageJob): Promise<void> {
    // key here represents the image url
    const { userId, imgId, imgVersion, key } = image
    await UserModel.updateOne({ _id: userId }, { $set: { profilePicture: key } })
    await this.addImage({ userId, imgId, imgVersion, key: 'profile' })
  }

  /**
   * addBackgroundPicture
   */
  public async addBackgroundPicture(image: IFileImageJob): Promise<void> {
    // key here represents the image url
    const { userId, imgId, imgVersion } = image
    await UserModel.updateOne(
      { _id: userId },
      { $set: { bgImageId: imgId, bgImageVersion: imgVersion } }
    )
    await this.addImage({ userId, imgId, imgVersion, key: 'background' })
  }

  /**
   * addImage
   */
  public async addImage(image: IFileImageJob): Promise<void> {
    // key here represents the image type
    const { userId, imgId, imgVersion, key } = image
    await ImageModel.create({
      userId,
      bgImageVersion: key === 'background' ? imgVersion : '',
      bgImageId: key === 'background' ? imgId : '',
      imgVersion: key === 'profile' ? imgVersion : '',
      imgId: key === 'profile' ? imgId : ''
    })
  }

  /**
   * removeImage
   */
  public async getBackgroundPicture(bgImageId: string): Promise<IFileImageDocument> {
    const image: IFileImageDocument = (await ImageModel.findOne({
      bgImageId
    }).exec()) as IFileImageDocument
    return image
  }

  /**
   * getImages
   */
  public async getImages(userId: string): Promise<IFileImageDocument[]> {
    const images: IFileImageDocument[] = await ImageModel.aggregate([
      { $match: { userId: new ObjectId(userId) } }
    ])
    return images
  }

  /**
   * removeImage
   */
  public async removeImage(image: IFileImageJob): Promise<void> {
    const { key } = image
    await ImageModel.deleteOne({ _id: key }).exec()
  }
}

export const image: ImageService = new ImageService()

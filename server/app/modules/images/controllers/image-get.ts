import { Request, Response } from 'express'
import HTTP_STATUS from 'http-status-codes'

import { image } from '@service/db/image.service'
import { IFileImageDocument } from '@image/interfaces/image.interface'

export class ImageGet {
  public async backgroundPicture(req: Request, res: Response): Promise<void> {
    const { imageId } = req.params

    // get image data from database
    const img: IFileImageDocument = await image.getBackgroundPicture(imageId)

    res.status(HTTP_STATUS.OK).json({
      message: 'Get background image successful',
      image: img
    })
  }

  public async many(req: Request, res: Response): Promise<void> {
    const { userId } = req.params

    // get image data from database
    const images: IFileImageDocument[] = await image.getImages(userId)

    res.status(HTTP_STATUS.OK).json({
      message: 'Get images successful',
      images
    })
  }
}

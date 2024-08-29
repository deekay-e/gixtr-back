import { Request, Response } from 'express'
import HTTP_STATUS from 'http-status-codes'

import { socketIOImageObject } from '@socket/image'
import { imageQueue } from '@service/queues/image.queue'
import { IFileImageJob } from '@image/interfaces/image.interface'

export class ImageRemove {
  public async init(req: Request, res: Response): Promise<void> {
    const { imageId } = req.params

    // emit socket event for image object
    socketIOImageObject.emit('remove image', imageId)

    // delete image data from databse
    const query: IFileImageJob = { key: imageId }
    imageQueue.addImageJob('removeImage', query)

    res.status(HTTP_STATUS.OK).json({ message: 'Remove image successful' })
  }
}

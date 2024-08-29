import { imageWorker } from '@worker/image.worker'
import { BaseQueue } from '@service/queues/base.queue'
import { IFileImageJob } from '@image/interfaces/image.interface'

class AuthQueue extends BaseQueue {
  constructor() {
    super('image')

    this.processJob('addImage', 5, imageWorker.addImage)
    this.processJob('removeImage', 5, imageWorker.removeImage)
    this.processJob('addProfilePicture', 5, imageWorker.addProfilePicture)
    this.processJob('addBackgroundPicture', 5, imageWorker.addBackgroundPicture)
  }

  public addImageJob(name: string, data: IFileImageJob): void {
    this.addJob(name, data)
  }
}

export const imageQueue: AuthQueue = new AuthQueue()

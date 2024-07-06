import { postWorker } from '@worker/post.worker'
import { BaseQueue } from '@service/queues/base.queue'
import { IPostJob } from '@post/interfaces/post.interface'


class PostQueue extends BaseQueue {
  constructor() {
    super('post')

    this.processJob('addToPost', 5, postWorker.addPostToDB)
    this.processJob('deletePost', 5, postWorker.deletePost)
  }

  public addPostJob(name: string, data: IPostJob): void {
    this.addJob(name, data)
  }
}

export const postQueue: PostQueue = new PostQueue()

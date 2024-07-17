import { commentWorker } from '@worker/comment.worker'
import { BaseQueue } from '@service/queues/base.queue'
import { ICommentJob } from '@comment/interfaces/comment.interface'

class CommentQueue extends BaseQueue {
  constructor() {
    super('comment')

    this.processJob('addComment', 5, commentWorker.addComment)
    this.processJob('getComment', 5, commentWorker.getComment)
    this.processJob('getComments', 5, commentWorker.getComments)
    this.processJob('deleteComment', 5, commentWorker.deleteComment)
    this.processJob('getCommentsNames', 5, commentWorker.getCommentsNames)
  }

  public addCommentJob(name: string, data: ICommentJob): void {
    this.addJob(name, data)
  }
}

export const commentQueue: CommentQueue = new CommentQueue()

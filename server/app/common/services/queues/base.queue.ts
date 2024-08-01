import Logger from 'bunyan'
import Queue, { Job } from 'bull'
import { createBullBoard } from '@bull-board/api'
import { ExpressAdapter } from '@bull-board/express'
import { BullAdapter } from '@bull-board/api/bullAdapter'

import { config } from '@/config'
import { IAuthJob } from '@auth/interfaces/auth.interface'
import { IChatJob } from '@chat/interfaces/chat.interface'
import { IPostJob } from '@post/interfaces/post.interface'
import { IFileImageJob } from '@image/interfaces/image.interface'
import { ICommentJob } from '@comment/interfaces/comment.interface'
import { IMailJob, IUserJob } from '@user/interfaces/user.interface'
import { IReactionJob } from '@reaction/interfaces/reaction.interface'
import { INotificationJob } from '@notification/interfaces/notification.interface'
import { IBlockedUserJob, IFollowerJob } from '@follower/interfaces/follower.interface'

type IBaseJob =
  | IAuthJob
  | IChatJob
  | IUserJob
  | IMailJob
  | IPostJob
  | IReactionJob
  | ICommentJob
  | IFollowerJob
  | IBlockedUserJob
  | INotificationJob
  | IFileImageJob

let bullAdapters: BullAdapter[] = []

export let serverAdapter: ExpressAdapter

export abstract class BaseQueue {
  log: Logger
  queue: Queue.Queue

  constructor(queueName: string) {
    this.queue = new Queue(queueName, `${config.REDIS_HOST}`)
    bullAdapters.push(new BullAdapter(this.queue))
    bullAdapters = [...new Set(bullAdapters)]

    serverAdapter = new ExpressAdapter()
    serverAdapter.setBasePath('/queues')

    createBullBoard({
      serverAdapter,
      queues: bullAdapters
    })

    this.log = config.createLogger(`${queueName}Queue`)

    this.queue.on('completed', (job: Job) => {
      job.remove()
      this.log.info(`Job ${job.id} removed from queue.`)
    })

    this.queue.on('global:completed', (jobId: string) => {
      this.log.info(`Job ${jobId} completed.`)
    })

    this.queue.on('global:stalled', (jobId: string) => {
      this.log.info(`Job ${jobId} is on pause.`)
    })
  }

  protected addJob(name: string, data: IBaseJob): void {
    this.queue.add(name, data, { attempts: 3, backoff: { type: 'fixed', delay: 5000 } })
  }

  protected processJob(
    name: string,
    concurrency: number,
    callback: Queue.ProcessCallbackFunction<void>
  ): void {
    this.queue.process(name, concurrency, callback)
  }
}

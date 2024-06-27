import Logger from 'bunyan'
import Queue, { Job } from 'bull'
import { createBullBoard } from '@bull-board/api'
import { ExpressAdapter } from '@bull-board/express'
import { BullAdapter } from '@bull-board/api/bullAdapter'

import { config } from '@/config'
import { IAuthJob } from '@auth/interfaces/auth.interface'
import { IUserJob } from '@user/interfaces/user.interface'

type IBaseJob =
  | IAuthJob | IUserJob

let bullAdapters: BullAdapter[] = []

export let serverAdapter: ExpressAdapter

export abstract class BaseQueue {
  queue: Queue.Queue
  log: Logger

  constructor(queueName: string) {
    this.queue = new Queue(queueName, `${config.REDIS_HOST}`)
    bullAdapters.push(new BullAdapter(this.queue))
    bullAdapters = [...new Set(bullAdapters)]

    serverAdapter = new ExpressAdapter()
    serverAdapter.setBasePath('/queues')

    createBullBoard({
      queues: bullAdapters,
      serverAdapter
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

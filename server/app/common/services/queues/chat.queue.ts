import { chatWorker } from '@worker/chat.worker'
import { BaseQueue } from '@service/queues/base.queue'
import { IChatJob } from '@chat/interfaces/chat.interface'

class ChatQueue extends BaseQueue {
  constructor() {
    super('chat')

    this.processJob('addMessage', 5, chatWorker.addMessage)
    this.processJob('markMessageAsDeleted', 5, chatWorker.markMessageAsDeleted)
  }

  public addChatJob(name: string, data: IChatJob): void {
    this.addJob(name, data)
  }
}

export const chatQueue: ChatQueue = new ChatQueue()

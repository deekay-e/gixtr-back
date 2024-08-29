import { chatWorker } from '@worker/chat.worker'
import { BaseQueue } from '@service/queues/base.queue'
import { IChatJob, IChatList } from '@chat/interfaces/chat.interface'

class ChatQueue extends BaseQueue {
  constructor() {
    super('chat')

    this.processJob('addMessage', 5, chatWorker.addMessage)
    this.processJob('markMessagesAsRead', 5, chatWorker.markMessagesAsRead)
    this.processJob('markMessageAsDeleted', 5, chatWorker.markMessageAsDeleted)
    this.processJob('updateMessageReaction', 5, chatWorker.updateMessageReaction)
  }

  public addChatJob(name: string, data: IChatJob | IChatList): void {
    this.addJob(name, data)
  }
}

export const chatQueue: ChatQueue = new ChatQueue()

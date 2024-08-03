import Logger from 'bunyan'
import { findIndex } from 'lodash'

import { config } from '@/config'
import { BaseCache } from '@service/redis/base.cache'
import { IChatJob, IChatList } from '@chat/interfaces/chat.interface'
import { ServerError } from '@global/helpers/error-handler'

const log: Logger = config.createLogger('chatCache')

export class ChatCache extends BaseCache {
  constructor() {
    super('chatCache')
  }

  /**
   * addChatList
   */
  public async addChatList(chat: IChatList): Promise<void> {
    const { senderId, receiverId, conversationId } = chat
    try {
      if (!this.client.isOpen) await this.client.connect()

      const senderChatList = await this.client.LRANGE(`chatList:${senderId}`, 0, -1)
      if (!senderChatList.length) {
        await this.client.RPUSH(
          `chatList:${senderId}`,
          JSON.stringify({ receiverId, conversationId })
        )
      } else {
        const receiverIndex: number = findIndex(senderChatList, (item: string) =>
          item.includes(receiverId)
        )
        if (receiverIndex < 0) {
          await this.client.RPUSH(
            `chatList:${senderId}`,
            JSON.stringify({ receiverId, conversationId })
          )
        }
      }
    } catch (error) {
      log.error(error)
      throw new ServerError('Server error. Try again.')
    }
  }
}

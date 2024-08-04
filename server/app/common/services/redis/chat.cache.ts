import Logger from 'bunyan'
import { findIndex } from 'lodash'

import { config } from '@/config'
import { BaseCache } from '@service/redis/base.cache'
import { IChatJob, IChatList, IChatUsers, IMessageData } from '@chat/interfaces/chat.interface'
import { ServerError } from '@global/helpers/error-handler'
import { Utils } from '@global/helpers/utils'

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

  /**
   * addChatMessage
   */
  public async addChatMessage(conversationId: string, data: IMessageData): Promise<void> {
    try {
      if (!this.client.isOpen) await this.client.connect()

      await this.client.RPUSH(`messages:${conversationId}`, JSON.stringify(data))
    } catch (error) {
      log.error(error)
      throw new ServerError('Server error. Try again.')
    }
  }

  /**
   * addChatUsers
   */
  public async addChatUsers(data: IChatUsers): Promise<IChatUsers[]> {
    try {
      if (!this.client.isOpen) await this.client.connect()

      const users: IChatUsers[] = await this.getChatUsersList()
      const usersIndex: number = findIndex(
        users,
        (item: IChatUsers) => JSON.stringify(item) === JSON.stringify(data)
      )
      let chatUsers: IChatUsers[] = []
      if (usersIndex < 0) {
        await this.client.RPUSH('chatUsers', JSON.stringify(data))
        chatUsers = await this.getChatUsersList()
      } else chatUsers = users

      return chatUsers
    } catch (error) {
      log.error(error)
      throw new ServerError('Server error. Try again.')
    }
  }

  /**
   * removeChatUsers
   */
  public async removeChatUsers(data: IChatUsers): Promise<IChatUsers[]> {
    try {
      if (!this.client.isOpen) await this.client.connect()

      const users: IChatUsers[] = await this.getChatUsersList()
      const usersIndex: number = findIndex(
        users,
        (item: IChatUsers) => JSON.stringify(item) === JSON.stringify(data)
      )
      let chatUsers: IChatUsers[] = []
      if (usersIndex >= 0) {
        await this.client.LREM('chatUsers', usersIndex, JSON.stringify(data))
        chatUsers = await this.getChatUsersList()
      } else chatUsers = users

      return chatUsers
    } catch (error) {
      log.error(error)
      throw new ServerError('Server error. Try again.')
    }
  }

  private async getChatUsersList(): Promise<IChatUsers[]> {
    const chatUsersList: IChatUsers[] = []
    const chatUsers = await this.client.LRANGE('chatUsers', 0, -1)
    for (const item of chatUsers) {
      const chatUser: IChatUsers = Utils.parseJson(item) as IChatUsers
      chatUsersList.push(chatUser)
    }

    return chatUsersList
  }
}

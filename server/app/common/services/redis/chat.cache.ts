import Logger from 'bunyan'
import { find, findIndex, remove } from 'lodash'

import { config } from '@/config'
import { Utils } from '@global/helpers/utils'
import { BaseCache } from '@service/redis/base.cache'
import { ServerError } from '@global/helpers/error-handler'
import {
  IChatJob,
  IChatList,
  IChatUsers,
  IGetMessage,
  IMessageData
} from '@chat/interfaces/chat.interface'
import { IReaction } from '@reaction/interfaces/reaction.interface'

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

  /**
   * getUserConversations
   */
  public async getUserConversations(key: string): Promise<IMessageData[]> {
    try {
      if (!this.client.isOpen) await this.client.connect()

      const conversations: IMessageData[] = []
      const userChats: string[] = await this.client.LRANGE(`chatList:${key}`, 0, -1)
      for (const item of userChats) {
        const chat: IChatList = Utils.parseJson(item) as IChatList
        const lastMessage: string = (await this.client.LINDEX(
          `messages:${chat.conversationId}`,
          -1
        )) as string
        conversations.push(Utils.parseJson(lastMessage))
      }

      return conversations
    } catch (error) {
      log.error(error)
      throw new ServerError('Server error. Try again.')
    }
  }

  /**
   * getChatMessages
   */
  public async getChatMessages(chatList: IChatList): Promise<IMessageData[]> {
    const { senderId, receiverId, conversationId } = chatList
    try {
      if (!this.client.isOpen) await this.client.connect()

      const chatMessages: IMessageData[] = []
      if (conversationId) {
        const messages: string[] = await this.client.LRANGE(`messages:${conversationId}`, 0, -1)
        for (const message of messages) {
          const chat: IMessageData = Utils.parseJson(message) as IMessageData
          chatMessages.push(chat)
        }
      } else {
        const userChats: string[] = await this.client.LRANGE(`chatList:${senderId}`, 0, -1)
        const receiver: string = find(userChats, (item: string) =>
          item.includes(receiverId)
        ) as string
        const parsedReceiver: IChatList = Utils.parseJson(receiver) as IChatList
        if (parsedReceiver) {
          const messages: string[] = await this.client.LRANGE(
            `messages:${parsedReceiver.conversationId}`,
            0,
            -1
          )
          for (const message of messages) {
            const chat: IMessageData = Utils.parseJson(message) as IMessageData
            chatMessages.push(chat)
          }
        } else return []
      }

      return chatMessages
    } catch (error) {
      log.error(error)
      throw new ServerError('Server error. Try again.')
    }
  }

  /**
   * markMessageAsDeleted
   */
  public async markMessageAsDeleted(chatJob: IChatJob): Promise<IMessageData> {
    const { senderId, receiverId, messageId, type } = chatJob
    try {
      if (!this.client.isOpen) await this.client.connect()

      const { index, message, receiver } = await this.getMessage({
        senderId,
        receiverId,
        messageId
      })
      const chat: IMessageData = Utils.parseJson(message) as IMessageData
      if (type === 'deleteForMe') chat.deleteForMe = true
      else {
        chat.deleteForMe = true
        chat.deleteForEveryone = true
      }
      await this.client.LSET(`messages:${receiver.conversationId}`, index, JSON.stringify(chat))

      // we can return the "chat" object or fetch it from the messages list
      // - const updatedChat: string = (await this.client.LINDEX(
      // -   `messages:${receiver.conversationId}`,
      // -   index
      // - )) as string
      // - return Utils.parseJson(updatedChat) as IMessageData
      return chat
    } catch (error) {
      log.error(error)
      throw new ServerError('Server error. Try again.')
    }
  }

  /**
   * markMessagesAsRead
   */
  public async markMessagesAsRead(chatList: IChatList): Promise<IMessageData> {
    try {
      if (!this.client.isOpen) await this.client.connect()

      const messages: IMessageData[] = await this.getChatMessages(chatList)
      for (const [index, item] of messages.entries()) {
        if (item.isRead) continue
        item.isRead = true
        await this.client.LSET(`messages:${item.conversationId}`, index, JSON.stringify(item))
      }

      return messages[-1]
    } catch (error) {
      log.error(error)
      throw new ServerError('Server error. Try again.')
    }
  }

  /**
   * updateMessageReaction
   */
  public async updateMessageReaction(chatJob: IChatJob): Promise<IMessageData> {
    const { reaction, senderName, type } = chatJob
    try {
      if (!this.client.isOpen) await this.client.connect()

      const reactions: IReaction[] = []
      const { index, receiver, message } = await this.getMessage(chatJob)
      const parsedMessage: IMessageData = Utils.parseJson(message) as IMessageData
      if (parsedMessage) {
        remove(parsedMessage.reaction, (item: IReaction) => item.senderName === senderName)
        if (type === 'add') {
          reactions.push({ senderName: senderName!, type: reaction! })
          parsedMessage.reaction = [...parsedMessage.reaction, ...reactions]
          await this.client.LSET(
            `messages:${receiver.conversationId}`,
            index,
            JSON.stringify(parsedMessage)
          )
        } else {
          await this.client.LSET(
            `messages:${receiver.conversationId}`,
            index,
            JSON.stringify(parsedMessage)
          )
        }
      }

      return parsedMessage
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

  private async getMessage(chatJob: IChatJob): Promise<IGetMessage> {
    const { senderId, receiverId, messageId } = chatJob
    const userChats: string[] = await this.client.LRANGE(`chatList:${senderId}`, 0, -1)
    const receiver: string = find(userChats, (item: string) =>
      item.includes(`${receiverId}`)
    ) as string
    const parsedReceiver: IChatList = Utils.parseJson(receiver) as IChatList
    const messages: string[] = await this.client.LRANGE(
      `messages:${parsedReceiver.conversationId}`,
      0,
      -1
    )
    const message: string = find(messages, (item: string) =>
      item.includes(`${messageId}`)
    ) as string
    const index: number = findIndex(messages, (item: string) => item.includes(`${messageId}`))

    return { index, message, receiver: parsedReceiver }
  }
}

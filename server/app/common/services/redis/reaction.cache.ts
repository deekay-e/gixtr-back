import Logger from 'bunyan'
import { find } from 'lodash'

import { config } from '@/config'
import { Utils } from '@global/helpers/utils'
import { BaseCache } from '@service/redis/base.cache'
import { ServerError } from '@global/helpers/error-handler'
import { IReactionDocument, IReactions } from '@reaction/interfaces/reaction.interface'

const log: Logger = config.createLogger('reactionCache')

export class ReactionCache extends BaseCache {
  constructor() {
    super('reactionCache')
  }

  /**
   * addReactionToCache
   */
  public async addReaction(
    key: string,
    reaction: IReactionDocument,
    postReactions: IReactions,
    type: string,
    prevReaction: string
  ): Promise<void> {
    try {
      if (!this.client.isOpen) await this.client.connect()

      if (prevReaction) this.removeReaction(key, reaction.username, postReactions)

      if (type) {
        await this.client.LPUSH(`reactions:${key}`, JSON.stringify(reaction))
        await this.client.HSET(`posts:${key}`, 'reactions', JSON.stringify(postReactions))
      }
    } catch (error) {
      log.error(error)
      throw new ServerError('Server error. Try again.')
    }
  }

  /**
   * removeReactionFromCache
   */
  public async removeReaction(
    key: string,
    username: string,
    postReactions: IReactions
  ): Promise<void> {
    try {
      if (!this.client.isOpen) await this.client.connect()

      const reactions: string[] = await this.client.LRANGE(`reactions:${key}`, 0, -1)
      const prevReaction: IReactionDocument = this.getPrevReaction(
        reactions,
        username
      ) as IReactionDocument
      this.client.LREM(`reactions:${key}`, 1, JSON.stringify(prevReaction))

      await this.client.HSET(`posts:${key}`, 'reactions', JSON.stringify(postReactions))
    } catch (error) {
      log.error(error)
      throw new ServerError('Server error. Try again.')
    }
  }

  private getPrevReaction(reactions: string[], username: string): IReactionDocument | undefined {
    const reactionList: IReactionDocument[] = []
    for (const item of reactions) reactionList.push(Utils.parseJson(item) as IReactionDocument)
    return find(reactionList, (item: IReactionDocument) => item.username === username)
  }
}

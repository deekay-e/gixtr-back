import Logger from 'bunyan'
import { find } from 'lodash'

import { config } from '@/config'
import { Utils } from '@global/helpers/utils'
import { BaseCache } from '@service/redis/base.cache'
import { ServerError } from '@global/helpers/error-handler'
import { ICommentDocument, ICommentNameList } from '@comment/interfaces/comment.interface'

const log: Logger = config.createLogger('commentCache')

export class CommentCache extends BaseCache {
  constructor() {
    super('commentCache')
  }

  /**
   * addComment
   */
  public async addComment(postId: string, comment: ICommentDocument): Promise<void> {
    try {
      if (!this.client.isOpen) await this.client.connect()

      const commentsCount: string[] = await this.client.HMGET(`posts:${postId}`, 'commentsCount')
      const count: number = parseInt(commentsCount[0], 10) + 1

      await this.client.LPUSH(`comments:${postId}`, JSON.stringify(comment))
      await this.client.HSET(`posts:${postId}`, 'commentsCount', count)
    } catch (error) {
      log.error(error)
      throw new ServerError('Server error. Try again.')
    }
  }

  /**
   * getComment
   */
  public async getComment(postId: string, commentId: string): Promise<ICommentDocument[]> {
    try {
      if (!this.client.isOpen) await this.client.connect()

      const comments: ICommentDocument[] = await this.getComments(postId)
      const comment: ICommentDocument = find(comments, (item: ICommentDocument) => {
        return item?._id === commentId
      }) as ICommentDocument
      return [comment]
    } catch (error) {
      log.error(error)
      throw new ServerError('Server error. Try again.')
    }
  }

  /**
   * getComments
   */
  public async getComments(postId: string): Promise<ICommentDocument[]> {
    try {
      if (!this.client.isOpen) await this.client.connect()

      let comments: ICommentDocument[] = []
      const cacheComments: string[] = await this.client.LRANGE(`comments:${postId}`, 0, -1)
      for (const item of cacheComments) comments.push(Utils.parseJson(item))
      return comments
    } catch (error) {
      log.error(error)
      throw new ServerError('Server error. Try again.')
    }
  }

  /**
   * getCommentsNames
   */
  public async getCommentsNames(postId: string): Promise<ICommentNameList[]> {
    try {
      if (!this.client.isOpen) await this.client.connect()

      const names: string[] = []
      const count: number = await this.client.LLEN(`comments:${postId}`)
      const comments: string[] = await this.client.LRANGE(`comments:${postId}`, 0, -1)
      for (const item of comments) names.push(Utils.parseJson(item).username)

      const nameList: ICommentNameList = { count, names }
      return [nameList]
    } catch (error) {
      log.error(error)
      throw new ServerError('Server error. Try again.')
    }
  }

  /**
   * updateComment
   */
  public async updateComment(postId: string, commentId: string, comment: string): Promise<void> {
    try {
      if (!this.client.isOpen) await this.client.connect()

      const oldComment: ICommentDocument[] = await this.getComment(postId, commentId)
      oldComment[0].comment = comment
      await this.deleteComment(postId, commentId)
      await this.addComment(postId, oldComment[0])
    } catch (error) {
      log.error(error)
      throw new ServerError('Server error. Try again.')
    }
  }

  /**
   * deleteComment
   */
  public async deleteComment(postId: string, commentId: string): Promise<void> {
    try {
      if (!this.client.isOpen) await this.client.connect()

      const comment: ICommentDocument[] = await this.getComment(postId, commentId)
      this.client.LREM(`comments:${postId}`, 1, JSON.stringify(comment[0]))
    } catch (error) {
      log.error(error)
      throw new ServerError('Server error. Try again.')
    }
  }
}

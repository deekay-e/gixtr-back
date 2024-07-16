import Logger from 'bunyan'
import { find } from 'lodash'

import { config } from '@/config'
import { Utils } from '@global/helpers/utils'
import { BaseCache } from '@service/redis/base.cache'
import { ServerError } from '@global/helpers/error-handler'
import { ICommentDocument } from '@comment/interfaces/comment.interface'

const log: Logger = config.createLogger('commentCache')

export class CommentCache extends BaseCache {
  constructor() {
    super('commentCache')
  }

  /**
   * addComment
   */
  public async addComment(
    key: string,
    comment: ICommentDocument
  ): Promise<void> {
    try {
      if (!this.client.isOpen) await this.client.connect()

      const commentsCount: string[] = await this.client.HMGET(`posts:${key}`, 'commentsCount')
      const count: number = parseInt(commentsCount[0], 10) + 1

      await this.client.LPUSH(`comments:${key}`, JSON.stringify(comment))
      await this.client.HSET(`posts:${key}`, 'commentsCount', count)
    } catch (error) {
      log.error(error)
      throw new ServerError('Server error. Try again.')
    }
  }

  /**
   * getComments
   */
  public async getComments(key: string): Promise<[ICommentDocument[], number]> {
    try {
      if (!this.client.isOpen) await this.client.connect()

      let comments: ICommentDocument[] = []
      const count: number = await this.client.LLEN(`comments:${key}`)
      const cacheComments: string[] = await this.client.LRANGE(`comments:${key}`, 0, -1)
      for (const item of cacheComments) comments.push(Utils.parseJson(item))
      return comments.length ? [comments, count] : [[], 0]
    } catch (error) {
      log.error(error)
      throw new ServerError('Server error. Try again.')
    }
  }

  /**
   * getComment
   */
  public async getComment(
    key: string,
    username: string
  ): Promise<[ICommentDocument, number] | []> {
    try {
      if (!this.client.isOpen) await this.client.connect()

      const comments: ICommentDocument[] = []
      const cacheComments: string[] = await this.client.LRANGE(`comments:${key}`, 0, -1)
      for (const item of cacheComments) comments.push(Utils.parseJson(item))
      const comment: ICommentDocument = find(comments, (item: ICommentDocument) => {
        return item?.postId === key && item?.username === username
      }) as ICommentDocument
      return comment ? [comment, 1] : []
    } catch (error) {
      log.error(error)
      throw new ServerError('Server error. Try again.')
    }
  }

  /**
   * updateComment
   */
  public async updateComment(
    key: string,
    username: string,
    comment: string
  ): Promise<void> {
    try {
      if (!this.client.isOpen) await this.client.connect()

        const comments: string[] = await this.client.LRANGE(`comments:${key}`, 0, -1)
        const comment: ICommentDocument = this.getCommentPriv(
          comments,
          username
        ) as ICommentDocument
    } catch (error) {
      log.error(error)
      throw new ServerError('Server error. Try again.')
    }
  }

  /**
   * deleteComment
   */
  public async deleteComment(
    key: string,
    username: string
  ): Promise<void> {
    try {
      if (!this.client.isOpen) await this.client.connect()

      const comments: string[] = await this.client.LRANGE(`comments:${key}`, 0, -1)
      const comment: ICommentDocument = this.getCommentPriv(
        comments,
        username
      ) as ICommentDocument

      this.client.LREM(`comments:${key}`, 1, JSON.stringify(comment))
    } catch (error) {
      log.error(error)
      throw new ServerError('Server error. Try again.')
    }
  }

  private getCommentPriv(comments: string[], username: string): ICommentDocument | undefined {
    const commentList: ICommentDocument[] = []
    for (const item of comments) commentList.push(Utils.parseJson(item) as ICommentDocument)

    return find(commentList, (item: ICommentDocument) => item.username === username)
  }
}

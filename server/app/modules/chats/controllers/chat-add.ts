import { ObjectId } from 'mongodb'
import { Request, Response } from 'express'
import HTTP_STATUS from 'http-status-codes'
import { UploadApiResponse } from 'cloudinary'

import { config } from '@/config'
import { socketIOChatObject } from '@socket/chat'
import { UserCache } from '@service/redis/user.cache'
import { mailQueue } from '@service/queues/mail.queue'
import { chatQueue } from '@service/queues/chat.queue'
import { addChatSchema } from '@chat/schemas/chat.schema'
import { uploads } from '@global/helpers/cloudinary-upload'
import { BadRequestError } from '@global/helpers/error-handler'
import { JoiValidator } from '@global/decorators/joi-validation'
import { IUserDocument } from '@user/interfaces/user.interface'
import { notification } from '@service/email/templates/notification/template'
import { INotificationTemplate } from '@notification/interfaces/notification.interface'
import { IChatJob, IMessageData, IMessageNotification } from '@chat/interfaces/chat.interface'
import { ChatCache } from '@service/redis/chat.cache'

const CN: string = config.CLOUD_NAME!
const chatCache: ChatCache = new ChatCache()
const userCache: UserCache = new UserCache()

export class ChatAdd {
  @JoiValidator(addChatSchema)
  public async message(req: Request, res: Response): Promise<void> {
    const {
      conversationId,
      receiverId,
      receiverUsername,
      receiverAvatarColor,
      receiverProfilePicture,
      body,
      gifUrl,
      isRead,
      selectedImage
    } = req.body
    const userId = req.currentUser!.userId
    let imageUrl = ''
    const messageOId: ObjectId = new ObjectId()
    const conversationOId: ObjectId = !conversationId
      ? new ObjectId()
      : new ObjectId(conversationId)

    const sender: IUserDocument = (await userCache.getUser(userId)) as IUserDocument
    if (selectedImage.length) {
      // upload chat image to cloudinary
      const result: UploadApiResponse = (await uploads(selectedImage)) as UploadApiResponse
      const imgId = result?.public_id
      const imgVersion = `${result.version}`
      if (!imgId) throw new BadRequestError(result.message)

      imageUrl = `https://res.cloudinary.com/${CN}/image/upload/v${imgVersion}/${userId}`
    }

    const message: IMessageData = {
      _id: `${messageOId}`,
      conversationId: conversationOId,
      receiverId,
      receiverUsername,
      receiverAvatarColor,
      receiverProfilePicture,
      senderId: req.currentUser!.userId,
      senderUsername: req.currentUser!.username,
      senderAvatarColor: req.currentUser!.avatarColor,
      senderProfilePicture: sender.profilePicture,
      body,
      gifUrl,
      isRead,
      selectedImage: imageUrl,
      reaction: [],
      createdAt: new Date(),
      deleteForEveryone: false,
      deleteForMe: false
    }

    // add chat data to redis
    // - add sender to chat list in redis
    await chatCache.addChatList({
      senderId: userId,
      receiverId,
      conversationId: `${conversationOId}`
    })
    // - add receiver to chat list in redis
    await chatCache.addChatList({
      senderId: receiverId,
      receiverId: userId,
      conversationId: `${conversationOId}`
    })
    // - add message data to redis
    await chatCache.addChatMessage(`${conversationOId}`, message)

    // emit socket event for chat object
    ChatAdd.prototype.emitSocketIOEvent(message)

    const data: IMessageNotification = {
      currentUser: req.currentUser!,
      message: body,
      receiverId,
      receiverName: receiverUsername
    } as IMessageNotification
    if (!isRead) ChatAdd.prototype.messageNotification(data)

    // add chat data to databse
    const chatJob: IChatJob = { message }
    chatQueue.addChatJob('addMessage', chatJob)

    res
      .status(HTTP_STATUS.OK)
      .json({ message: 'Chat message addition successful', conversationId: conversationOId })
  }

  public async addChatUsers(req: Request, res: Response): Promise<void> {
    const chatUsers = await chatCache.addChatUsers(req.body)
    socketIOChatObject.emit('add chat users', chatUsers)
    res.status(HTTP_STATUS.OK).json({ message: 'Add chat users successful' })
  }

  public async removeChatUsers(req: Request, res: Response): Promise<void> {
    const chatUsers = await chatCache.removeChatUsers(req.body)
    socketIOChatObject.emit('remove chat users', chatUsers)
    res.status(HTTP_STATUS.OK).json({ message: 'Remove chat users successful' })
  }

  private emitSocketIOEvent(data: IMessageData): void {
    socketIOChatObject.emit('chat list', data)
    socketIOChatObject.emit('message recieved', data)
  }

  private async messageNotification(data: IMessageNotification): Promise<void> {
    const { currentUser, receiverId, receiverName, message } = data
    const receiver: IUserDocument = (await userCache.getUser(receiverId)) as IUserDocument
    if (receiver.notifications.messages) {
      // send to email queue
      const templateData: INotificationTemplate = {
        username: receiverName,
        message,
        header: `Message Notification from ${currentUser.username}`
      }
      const template: string = notification.render(templateData)
      mailQueue.addMailJob('chatNotification', {
        receiver: receiver.email!,
        template,
        subject: `New chat message from ${currentUser.username}`
      })
    }
  }
}

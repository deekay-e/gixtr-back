import Joi, { ObjectSchema } from 'joi'

const addChatSchema: ObjectSchema = Joi.object().keys({
  conversationId: Joi.string().optional().allow(null, ''),
  receiverId: Joi.string().required(),
  receiverUsername: Joi.string().required(),
  receiverAvatarColor: Joi.string().required(),
  receiverProfilePicture: Joi.string().required(),
  body: Joi.string().optional().allow(null, ''),
  gifUrl: Joi.string().optional().allow(null, ''),
  selectedImage: Joi.string().optional().allow(null, ''),
  isRead: Joi.boolean().optional()
})

const markChatSchema: ObjectSchema = Joi.object().keys({
  senderId: Joi.string().optional().allow(null, ''),
  receiverId: Joi.string().optional().allow(null, ''),
  conversationId: Joi.string().optional().allow(null, '')
})

const messageReactionSchema: ObjectSchema = Joi.object().keys({
  type: Joi.string().required(),
  reaction: Joi.string().required(),
  messageId: Joi.string().required(),
  receiverId: Joi.string().required()
})

export { addChatSchema, markChatSchema, messageReactionSchema }

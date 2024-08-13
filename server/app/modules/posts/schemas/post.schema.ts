import Joi, { ObjectSchema } from 'joi'

const postSchema: ObjectSchema = Joi.object().keys({
  post: Joi.string().optional().allow(null, ''),
  scope: Joi.string().optional().allow(null, ''),
  gifUrl: Joi.string().optional().allow(null, ''),
  bgColor: Joi.string().optional().allow(null, ''),
  feelings: Joi.string().optional().allow(null, ''),
  profilePicture: Joi.string().optional().allow(null, ''),
  vidVersion: Joi.string().optional().allow(null, ''),
  imgVersion: Joi.string().optional().allow(null, ''),
  imgId: Joi.string().optional().allow(null, ''),
  vidId: Joi.string().optional().allow(null, ''),
  image: Joi.string().optional().allow(null, ''),
  video: Joi.string().optional().allow(null, '')
})

const postWithImageSchema: ObjectSchema = Joi.object().keys({
  image: Joi.string().required().messages({
    'any.required': 'Image is a required field',
    'string.empty': 'Image property is not allowed to be empty'
  }),
  post: Joi.string().optional().allow(null, ''),
  bgColor: Joi.string().optional().allow(null, ''),
  scope: Joi.string().optional().allow(null, ''),
  feelings: Joi.string().optional().allow(null, ''),
  gifUrl: Joi.string().optional().allow(null, ''),
  profilePicture: Joi.string().optional().allow(null, ''),
  imgVersion: Joi.string().optional().allow(null, ''),
  imgId: Joi.string().optional().allow(null, '')
})

const postWithVideoSchema: ObjectSchema = Joi.object().keys({
  video: Joi.string().required().messages({
    'any.required': 'Video is a required field',
    'string.empty': 'Video property is not allowed to be empty'
  }),
  post: Joi.string().optional().allow(null, ''),
  vidId: Joi.string().optional().allow(null, ''),
  scope: Joi.string().optional().allow(null, ''),
  gifUrl: Joi.string().optional().allow(null, ''),
  bgColor: Joi.string().optional().allow(null, ''),
  feelings: Joi.string().optional().allow(null, ''),
  vidVersion: Joi.string().optional().allow(null, ''),
  profilePicture: Joi.string().optional().allow(null, '')
})

export { postSchema, postWithImageSchema, postWithVideoSchema }

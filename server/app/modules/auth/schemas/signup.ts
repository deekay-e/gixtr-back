import Joi, { ObjectSchema } from 'joi'

const registerSchema: ObjectSchema = Joi.object().keys({
  username: Joi.string().required().min(3).max(10).messages({
    'string.base': 'Username must be of type string',
    'string.min': 'Username must contain at least three characters',
    'string.max': 'Username must contain no more than ten characters',
    'string.empty': 'Username is a required field'
  }),
  password: Joi.string().required().min(4).max(16).messages({
    'string.base': 'Password must be of type string',
    'string.min': 'Password must contain at least four characters',
    'string.max': 'Password must contain no more than 16 characters',
    'string.empty': 'Password is a required field'
  }),
  email: Joi.string().required().email().messages({
    'string.base': 'Email must be of type string',
    'string.email': 'Email must be valid',
    'string.empty': 'Email is a required field'
  }),
  avatarColor: Joi.string().required().messages({
    'any.required': 'Avatar color is required'
  }),
  avatarImage: Joi.string().required().messages({
    'any.required': 'Avatar image is required'
  })
})

export { registerSchema }

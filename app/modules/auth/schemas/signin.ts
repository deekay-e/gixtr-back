import Joi, { ObjectSchema } from 'joi'

const loginSchema: ObjectSchema = Joi.object().keys({
  login: Joi.alternatives()
    .try(Joi.string().lowercase().email(), Joi.string().alphanum().min(3).max(30))
    .required()
    .error(new Error('Invalid email or userName')),
  password: Joi.string().required().min(4).max(16).messages({
    'string.base': 'Password must be of type string',
    'string.min': 'Invalid password',
    'string.max': 'Invalid password',
    'string.empty': 'Password is a required field'
  })
})

export { loginSchema }

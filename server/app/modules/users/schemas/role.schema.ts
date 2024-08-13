import Joi, { ObjectSchema } from 'joi'

const roleSchema: ObjectSchema = Joi.object().keys({
  role: Joi.string().required(),
  type: Joi.string().required(),
  userId: Joi.string().optional().allow(null, '')
})

export { roleSchema }

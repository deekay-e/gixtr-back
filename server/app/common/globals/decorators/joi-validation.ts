import { Request } from 'express'
import { ObjectSchema } from 'joi'

import { JoiRequestValidationError } from '@global/helpers/error-handler'

type IJoiDecorator = (target: any, key: string, descriptor: PropertyDescriptor) => void

export function joiValidator(schema: ObjectSchema): IJoiDecorator {
  return (_target: any, _key: any, descriptor: PropertyDescriptor) => {
    const OriginalMethod = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const req: Request = args[0]
      const { error } = await Promise.resolve(schema.validate(req.body))
      if (error?.details) throw new JoiRequestValidationError(error.details[0].message)
      return OriginalMethod.apply(this, args)
    }
    return descriptor
  }
}

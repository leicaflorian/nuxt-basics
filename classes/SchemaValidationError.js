import { BasicError } from './BasicError'

export class SchemaValidationError extends BasicError {
  /**
   * @param {Joi.ValidationError} data
   */
  constructor(data) {
    super(data.message)

    this.code = SchemaValidationError.httpCodes.UNPROCESSABLE_ENTITY
    this.stack = null
    this.details = data.details
  }
}

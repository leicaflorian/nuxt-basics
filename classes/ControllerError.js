import { BasicError } from './BasicError'

export class ControllerError extends BasicError {
  /**
   * @extends BasicError
   * @param {string} message
   * @param {Number} [code] = 400
   */
  constructor(message, code = BasicError.httpCodes.BAD_REQUEST) {
    super(message, code)
  }
}

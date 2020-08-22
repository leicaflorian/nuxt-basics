const HttpStatus = require('http-status-codes')

export class BasicError extends Error {
  /**
   *
   * @param {string} message
   * @param {Number} [code]
   */
  constructor(message, code) {
    super(message)

    this.code    = code || null
    this.message = this.message || 'Controller error - ' + this.constructor.name
  }

  static get httpCodes() {
    return HttpStatus
  }
}

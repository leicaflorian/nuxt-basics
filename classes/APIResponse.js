const HttpStatus = require('http-status-codes')

class DefaultResp {
  constructor(params) {
    this.message = params.message || ''
    this.data    = params.data || {}
    this.error   = params.error || null
  }
}

export class APIResponse {
  /**
   *
   * @param {{}} res
   * @param {{} || Error} payload
   * @param {number} [code]=200
   * @returns {*}
   */
  constructor(res, payload, code = 200) {
    if (payload instanceof Error && code === 200) {
      code = payload.code || 500
    }

    if (code === 200) {
      res.json(new DefaultResp({
        data: payload
      }))
    } else {
      const httpCode = (!isNaN(Number(payload.code)) ? payload.code : null) || code || 500

      console.info('- APIResponse error', payload)

      res.status(httpCode).json(new DefaultResp({
        message: payload.message || 'error',
        error:   {
          type:    payload.constructor.name,
          stack:   payload.stack,
          details: payload.details
        }
      }))

    }

    return res
  }

  static get httpCodes() {
    return HttpStatus
  }
}

import { APIResponse } from './APIResponse'
import schemaValidator from '../serverMiddleware/schemaValidator'

const { Router } = require('express')
const multer = require('multer') // multipart/form-data parsing

/**
 * @typedef CallOptions
 * @type {{}}
 *
 * @property {'get' | 'post' | 'patch' | 'update'} method='get'
 * @property {boolean} uploader=false - Specifies if it must include the uploader middleware for handling the incoming files
 * @property {boolean} downloader=false - Specifies if the file must be downloaded. In this case, changes te response
 */

export class BasicApiRoute {
  constructor () {
    this.router = Router()

    this.settings = {
      baseApi: '',

      /**
       * @type {CallOptions}
       */
      defaultCall: {
        method: 'get'
      }
    }

    this.uploader = multer({
      dest: 'fileSystem/'
    }).any()
  }

  _getFullPath (path) {
    return this.settings.baseApi + path
  }

  /**
   * @param {string} path
   * @param {function(req:Request, res:Response)} call
   * @param {{}} [options]
   * @param {string} options.method
   * @param {boolean} options.uploader
   * @param {string} options.downloader
   */
  addCall (path, call, options = {}) {
    const callOptions = Object.assign({}, this.settings.defaultCall, options || {})
    const fullPath = this._getFullPath(path)

    const middlewares = [schemaValidator]

    /*
     If the "uploader" option is true, includes the file uploader middleware
     */
    if (options.uploader) {
      middlewares.unshift(this.uploader)
    }

    this.router[callOptions.method](fullPath, middlewares, async (req, res) => {
      try {
        const callResp = await call(req, res)

        if (!options.downloader) {
          return this._successResp(res, callResp)
        }
      } catch (e) {
        return this._errorResp(res, e)
      }
    })
  }

  /**
   * @param {string} path
   * @param {function(req:Request, res:Response)} call
   * @param {{}} [options]
   * @param {string} options.method
   * @param {boolean} options.uploader
   * @param {string} options.downloader
   */
  addPost (path, call, options = {}) {
    return this.addCall(path, call, Object.assign(options, {
      method: 'post'
    }))
  }

  /**
   * @param {string} path
   * @param {function(req:Request, res:Response)} call
   * @param {{}} [options]
   * @param {string} options.method
   * @param {boolean} options.uploader
   * @param {string} options.downloader
   */
  addGet (path, call, options = {}) {
    return this.addCall(path, call, options)
  }

  _successResp (res, data) {
    return new APIResponse(res, data)
  }

  _errorResp (res, error) {
    return new APIResponse(res, error, 500)
  }
}

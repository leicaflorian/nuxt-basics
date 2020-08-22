

/**
 *
 * @type {Joi.Root | Joi}
 * @see {@link https://github.com/sideway/joi/blob/master/API.md}
 */
const Joi = require('joi')

Joi.object().remapKeys = function (data, map) {
  let joiInstance = this

  if (!data || !map) {
    return joiInstance
  }

  for (const entry of Object.entries(data)) {
    const rawKey = entry[0]
    const key = rawKey.slice(rawKey.indexOf('$') + 1)
    const newKey = map[key] || key

    if (rawKey !== newKey) {
      joiInstance = joiInstance.rename(rawKey, newKey)
    }
  }

  return joiInstance
}

export class BasicJoiSchema {
  constructor(action) {

    /**
     *
     * @type {Joi.Root | Joi}
     * @protected
     */
    this.Joi = Joi

    this.presets = {
      basicString: this.Joi.string().replace('undefined', '').allow(''),
      booleanCast: this.Joi.any().custom(this.customValidators.booleanValidator).default(false)
    }

    /**
     * @type {Joi.ObjectSchema}
     * @protected
     */
    this._requestedSchema = this[this._formatRequestedActionName(action)]

  }

  /**
   *
   * @protected
   */
  get customValidators() {
    return {
      booleanValidator(value, helper) {
        let toReturn = !!value

        if (!isNaN(Number(value))) {
          toReturn = Boolean(Number(value))
        } else if (value === 'true' || value === 'false') {
          toReturn = value === 'true'
        } else if (value instanceof Boolean) {
          toReturn = value
        } else {
          toReturn = false
        }

        return toReturn
      }
    }
  }

  /**
   *
   * @param {string} action
   * @returns {string}
   * @private
   */
  _formatRequestedActionName(action = '') {
    const actionName = action.slice(0, 1).toUpperCase() + action.slice(1)

    return 'schema' + actionName
  }

  validate(data, options) {
    let schema = this._requestedSchema

    try {

      if (schema instanceof Function) {
        schema = schema.call(this, data)
      }

      return schema.validate(data, options)
    } catch (e) {
      return new this.Joi.ValidationError(e.message, e, null)
    }
  }

}

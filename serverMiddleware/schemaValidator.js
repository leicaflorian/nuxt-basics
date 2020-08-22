import Schemas                   from '../api/schemas'
import { SchemaValidationError } from '../classes/SchemaValidationError'
import { APIResponse }           from '../classes/APIResponse'

const _validationOptions = {
  abortEarly:   false,
  allowUnknown: true,
  stripUnknown: true
}

/**
 *
 * @param {{schema: string, action:string, method: string}} requestDetails
 * @returns {?BasicJoiSchema}
 *
 * @private
 */
function _getValidationSchema(requestDetails) {
  const schemaClass = Schemas[requestDetails.schema]

  if (!requestDetails.action || !schemaClass) {
    return null
  }

  try {
    const schemaInstance = new schemaClass(requestDetails.action)

    if (!schemaInstance) {
      return null
    }

    return schemaInstance
  } catch (e) {
    console.error(e)
  }
}

function _formatNewBodyData(data) {
  const toReturn = {}

  for (const entry of Object.entries(data)) {
    const key   = entry[0].split('.')
    const value = entry[1]

    if (key.length > 1) {
      if (!toReturn[key[0]]) {
        toReturn[key[0]] = {}
      }

      toReturn[key[0]][key[1]] = value
    } else {
      toReturn[key[0]] = value
    }
  }

  return toReturn
}

/**
 * @param {Request} req
 * @param {Response} res
 * @param next
 */
export default function (req, res, next) {
  /*
   the path should be formed like "/users/action"
   */
  const requestedApi = req.url.match(/\/\w+/g)
  const method       = req.method.toLowerCase()

  const requestDetails = {
    schema: (requestedApi[0] || '').replace('/', ''),
    action: (requestedApi[1] || '').replace('/', ''),
    method: method
  }

  const dataToValidate      = method === 'get' ? 'query' : 'body'
  const reqValidationSchema = _getValidationSchema(requestDetails)

  /**
   * @type {Joi.ValidationResult}
   */
  let validationResult = null

  if (reqValidationSchema) {
    validationResult = reqValidationSchema.validate(req[dataToValidate], _validationOptions)

    if (validationResult) {
      if (validationResult instanceof Error || validationResult.error) {
        const schemaError = new SchemaValidationError(validationResult.error)

        return new APIResponse(res, schemaError)
      } else if (validationResult.value) {
        req[dataToValidate] = _formatNewBodyData(validationResult.value)
      }
    }
  }

  next()
}

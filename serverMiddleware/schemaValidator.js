import { SchemaValidationError }     from '../classes/SchemaValidationError'
import { APIResponse }               from '../classes/APIResponse'
import { capitalize as _capitalize } from 'lodash'

const fs   = require('fs')
const path = require('path')

const availableSchemas = {}

const _validationOptions = {
  abortEarly:   false,
  allowUnknown: true,
  stripUnknown: true
}

async function _getSchemaClass (schema) {
  if (!schema) {
    return
  }

  // If the requested schema was already loaded, returns it,
  // only when not in development mode
  if (availableSchemas.hasOwnProperty(schema) && process.env.NODE_ENV !== 'development') {
    return availableSchemas[schema]
  }

  // Creates the schema path
  const schemaPath = path.resolve(`/api/schemas/${_capitalize(schema)}Schema.js`)

  // checks if the file exists
  if (!fs.existsSync(schemaPath)) {
    return
  }

  // imports the schema class as a module
  const schemaClass = (await import(schemaPath))[requestDetails.schema]

  // stores the class in the local cache variable
  availableSchemas[schema] = schemaClass

  return schemaClass
}

/**
 *
 * @param {{schema: string, action:string, method: string}} requestDetails
 * @returns {?BasicJoiSchema}
 *
 * @private
 */
async function _getValidationSchema (requestDetails) {
  const schemaClass = await _getSchemaClass(requestDetails.schema)

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

function _formatNewBodyData (data) {
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
export default async function (req, res, next) {
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
  const reqValidationSchema = await _getValidationSchema(requestDetails)

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

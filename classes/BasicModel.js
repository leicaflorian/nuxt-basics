import { ModelError } from './ModelError'

const { Schema, models, model } = require('mongoose')

export class BasicModel {
  constructor(documentName, schemaClass) {
    if (!documentName) {
      throw new ModelError('Missing model document name.')
    }
    if (!schemaClass) {
      throw new ModelError(`Missing models schema class for ${ documentName }.`)
    }

    /**
     * @type {String}
     */
    this._docName = documentName

    /**
     * @class
     */
    this._schema = schemaClass
  }

  /**
   *
   * @returns {Schema<any>}
   * @private
   * @protected
   */
  _initSchema() {
    const finalSchema = new this._schema()

    return finalSchema
  }

  /**
   * @returns {model}
   * @private
   */
  _initModel() {
    const schema = this._initSchema()

    return model(this._docName, schema)
  }

  /**
   * @returns {model|Model<any>}
   * @private
   * @protected
   */
  _getModel() {
    if (Object.keys(models).includes(this._docName)) {
      return models[this._docName]
    } else {
      return this._initModel()
    }
  }

  /**
   * @returns {model|Model<*>}
   */
  get mongoModel() {
    return this._getModel()
  }
}

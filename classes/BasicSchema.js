import { Schema } from 'mongoose'

export class BasicSchema {
  constructor() {
  }

  newSchema() {
    return new Schema({...this})
  }
}

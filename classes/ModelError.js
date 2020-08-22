import { BasicError } from './BasicError'

export class ModelError extends BasicError {
  constructor(data, code) {
    super(data, code)
  }
}

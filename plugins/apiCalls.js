import { BasicApiCall } from '~/classes/BasicApiCall'

class ApiCalls extends BasicApiCall {
  constructor(context) {
    super(context)
  }

  async getAllUsers() {
    return super._get({
      endPoint:          '/users',
      loadingDispatcher: 'table'
    })
  }

  /**
   *
   * @param {{}} body
   * @param {string} body.email
   * @param {number} body.newState
   *
   *
   * @returns {Promise<void>}
   */
  async setAccreditationState(body) {
    return super._post({
      endPoint:   '/users/setAccreditationState',
      body,
      method:     'patch',
      setLoading: false
    })
  }

  /**
   *
   * @param {{userId: string}} body
   * @returns {Promise<void>}
   */
  async setUserAsVip(body) {
    return super._post({
      endPoint:   '/users/setAsVip',
      body,
      method:     'patch',
      setLoading: false
    })
  }

  async addUser(userData) {
    return super._post({
      endPoint:          '/users/add',
      body:              userData,
      uploadMode:        true,
      loadingDispatcher: 'confirmBtn'
    })
  }

  async updateUser(userData) {
    return super._post({
      endPoint:          '/users/update',
      body:              userData,
      uploadMode:        true,
      loadingDispatcher: 'confirmBtn'
    })
  }

  async deleteUser(body) {
    return super._post({
      endPoint:   '/users/delete',
      body:       body,
      method:     'delete',
      setLoading: false
    })
  }

  async downloadFile(fileId) {
    const rawResponse = await super._get({
      endPoint:     '/files/download',
      downloadMode: true,
      params:       {
        fileId
      }
    })

    const file = new Blob([ rawResponse.data ],
      { type: rawResponse.headers['x-file-mimetype'] })

    return URL.createObjectURL(file)
  }
}

export default (context, inject) => {
  const apiCalls = new ApiCalls(context)

  // Inject $hello(msg) in Vue, context and store.
  inject('apiCalls', apiCalls)

  // For Nuxt <= 2.12, also add 👇
  context.$apiCalls = apiCalls
}

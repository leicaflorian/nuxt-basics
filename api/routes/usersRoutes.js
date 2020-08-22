import { BasicApiRoute } from '../../classes/BasicApiRoute'
import UsersController   from '../../controllers/UsersController'

class UsersRoute extends BasicApiRoute {
  /**
   * @returns {Router}
   */
  constructor() {
    super()

    this.settings.baseApi = '/users'

    this.addCall('/', async () => {
      return await UsersController.findAll()
    })

    this.addCall('/add', async (req, res) => {
      return await UsersController.add(req.body, req.files)
    }, {
      method:   'post',
      uploader: true
    })

    this.addCall('/update', async (req) => {
      return await UsersController.update(req.body, req.files)
    }, {
      method:   'post',
      uploader: true
    })

    this.addCall('/delete', async (req) => {
      return await UsersController.delete(req.body.userId)
    }, {
      method: 'delete'
    })

    this.addCall('/setAccreditationState', async (req) => {
      return await UsersController.updateState({
        userId: req.body.userId,
        status: req.body.newState
      })
    }, {
      method: 'patch'
    })

    this.addCall('/setAsVip', async (req) => {
      return await UsersController.setAsVip({
        userId: req.body.userId,
        value:  req.body.newState
      })
    }, {
      method: 'patch'
    })


    /**
     * Call used from the old processwire form to add the same data in the new admin are
     *
     * This call should be temporary until the new FE area will be ready
     */
    this.addCall('/initFromPW', async (req, res) => {
      return await UsersController.initFromPW(req.body)
    }, {
      method: 'post'
    })

    /**
     * Call used from the old processwire form to add the same data in the new admin are
     *
     * This call should be temporary until the new FE area will be ready
     */
    this.addCall('/updateFromPW', async (req, res) => {
      return await UsersController.updateFromPW(req.body, req.files)
    }, {
      method:   'post',
      uploader: true
    })
  }
}

export default (new UsersRoute()).router

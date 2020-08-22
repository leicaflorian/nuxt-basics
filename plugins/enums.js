import UsersTypes          from '../enums/UsersTypes'
import UsersStatuses       from '../enums/UsersStatuses'
import UsersRoles          from '../enums/UsersRoles'
import Genders             from '../enums/Genders'
import NewspaperCategories from '../enums/NewspaperCategories'
import NewspaperTypes      from '../enums/NewspaperTypes'

export default (context, inject) => {
  const enums = {
    UsersStatuses,
    UsersTypes,
    UsersRoles,
    Genders,
    NewspaperCategories,
    NewspaperTypes
  }

  // Inject $hello(msg) in Vue, context and store.
  inject('enums', enums)

  // For Nuxt <= 2.12, also add 👇
  context.$enums = enums
}

import { BasicJoiSchema } from '../../classes/BasicJoiSchema'

const _pWFieldsMap = {
  ContactType:                   'type',
  email:                         '',
  name:                          'firstName',
  surname:                       'lastName',
  gender:                        '',
  country:                       '',
  province:                      '',
  city:                          '',
  postalcode:                    'postalCode',
  address:                       '',
  jcardnumber:                   'userTypeFields.cardNumber',
  jfunction:                     'userTypeFields.qualification',
  jfunctionother:                'userTypeFields.qualificationOther',
  jsector:                       '',
  jsectorother:                  '',
  jtitleofpublication:           'userTypeFields.publication',
  jtitleofpublicationother:      'userTypeFields.publicationOther',
  jpublishinghouse:              'userTypeFields.publishingHouse',
  jaddressofpublication:         '',
  jcountryofpublication:         'userTypeFields.publicationCountry',
  jtelephoneofpublication:       '',
  jtwitteraccount:               'userTypeFields.publicationSocial',
  jwebsiteofpublication:         'userTypeFields.publicationWebsite',
  jfrequencyofpublication:       '',
  jfrequencyofpublicationother:  '',
  jtypeofpublication:            'userTypeFields.publicationType',
  jtypeofpublicationother:       'userTypeFields.publicationTypeOther',
  jsectorofpublication:          'userTypeFields.publicationSector',
  jsectorofpublicationother:     'userTypeFields.publicationSectorOther',
  jotherpublicationa:            '',
  jotherpublicationb:            '',
  jotherpublicationc:            '',
  main_privacy:                  'privacy.main',
  privacy_third_party:           'privacy.thirdParty',
  press_accreditation_documents: 'documents'
  // register_name:                 '',
  // registrationsite:              '',
  // confirmation_key:              '',
  // profile_submit:                '',
  // TOKEN453840228X1597225610:     ''
}

class UsersApiSchema extends BasicJoiSchema {
  constructor(action) {
    super(action)

    /**
     * @type {Object.<string, Joi>}
     * @private
     */
    this._basicFields = {
      country:    this.presets.basicString.lowercase(),
      province:   this.presets.basicString.lowercase(),
      city:       this.presets.basicString,
      postalCode: this.presets.basicString,
      address:    this.presets.basicString,

      firstName: this.presets.basicString.empty('undefined'),
      lastName:  this.presets.basicString.empty('undefined'),
      email:     this.presets.basicString.email().empty('undefined'),
      gender:    this.presets.basicString.lowercase().empty('undefined'),

      language: this.presets.basicString,
      type:     this.presets.typeValidator,
      status:   this.presets.statusValidator
    }

    this._professionaFields = {
      'userTypeFields.cardNumber':             this.presets.basicString,
      'userTypeFields.qualification':          this.presets.basicString,
      'userTypeFields.qualificationOther':     this.presets.basicString,
      'userTypeFields.publication':            this.presets.basicString,
      'userTypeFields.publicationOther':       this.presets.basicString,
      'userTypeFields.publicationCountry':     this.presets.basicString,
      'userTypeFields.publishingHouse':        this.presets.basicString,
      'userTypeFields.publicationSocial':      this.presets.basicString,
      'userTypeFields.publicationWebsite':     this.presets.basicString,
      'userTypeFields.publicationType':        [ this.presets.basicString, this.Joi.array() ],
      'userTypeFields.publicationTypeOther':   this.presets.basicString,
      'userTypeFields.publicationSector':      [ this.presets.basicString, this.Joi.array() ],
      'userTypeFields.publicationSectorOther': this.presets.basicString,

      'userTypeFields.instaAccount':         this.presets.basicString,
      'userTypeFields.website':              this.presets.basicString,
      'userTypeFields.collaborationAgency1': this.presets.basicString,
      'userTypeFields.collaborationAgency2': this.presets.basicString,
      'userTypeFields.collaborationAgency3': this.presets.basicString
    }

    this._privacyFields = {
      'privacy.main':       this.presets.booleanCast,
      'privacy.thirdParty': this.presets.booleanCast
    }

    if (!this._requestedSchema) {
      return undefined
    }
  }

  schemaAdd() {
    return this.Joi.object().keys({
      ...this._basicFields,

      country:   this.Joi.string().required(),
      firstName: this.Joi.string().required(),
      lastName:  this.Joi.string().required(),
      email:     this._basicFields.email.required(),
      type:      this._basicFields.type.required(),

      status: this._basicFields.status.forbidden(),

      ...this._professionaFields,
      ...this._privacyFields
    })
  }

  schemaSetAccreditationState() {
    return this.Joi.object().keys({
      userId:   [ this.presets.basicString.required(),
        this.Joi.array().items(this.Joi.string().required()) ],
      newState: this._basicFields.status.required()
    })
  }

  schemaUpdate() {
    return this.Joi.object().keys({
      ...this._basicFields,
      ...this._professionaFields,
      ...this._privacyFields
    })
  }

  schemaDelete() {
    return this.Joi.object().keys({
      userId: this.presets.basicString.required()
    })
  }

  schemaSetAsVip() {
    return this.Joi.object().keys({
      userId:   this.presets.basicString.required(),
      newState: this.Joi.bool().required().default(false)
    })
  }

  schemaInitFromPW(data) {
    return this.Joi.object()
      .remapKeys(data, _pWFieldsMap).keys({
        email: this._basicFields.email.required()
      })
  }

  schemaUpdateFromPW(data) {
    return this.Joi.object()
      .remapKeys(data, _pWFieldsMap).keys({
        ...this._basicFields,
        ...this._professionaFields,
        ...this._privacyFields
      })
  }

}


export { UsersApiSchema }

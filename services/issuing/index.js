const newError = require("http-errors");
const {createHash} = require('crypto')
const hyperid = require('hyperid')()
const {addWeeks} = require('date-fns')
const {findByEmail, findByHashedPhone, findById} = require("./user-queries");
const {requestSchema, responseSchemas} = require("./identify-schemas");
// const {requestSchema, responseSchemas} = require("./identify-schemas");
const phoneSalt = 'E69C43DAE85C4BF7EC69CCD5D7485'; // 256bit salt

function identify(idDocument) {
  if (idDocument.email != null) {
    return findByEmail(idDocument.email);
  } else if (idDocument.phone != null) {
    const hashedPhone = createHash('sha256').update(`${phoneSalt}${idDocument.phone}`).digest('base64');
    return findByHashedPhone(hashedPhone);
  }

  return null;
}

function generateEmployeeOffers(
  employee,
  {
    vendorUserId,
    vendorOrganizationId,
    type: types = ["CurrentEmploymentPosition", "PastEmploymentPosition"]
  }) {
  const now = new Date();
  return types.flatMap((type) => {
    switch (type) {
      case "CurrentEmploymentPosition": {
        return [{
          type: ["CurrentEmploymentPosition"],
          issuer: {vendorOrganizationId},
          credentialSubject: {
            vendorUserId,
            company: employee.currentRole.company.did,
            companyName: {
              localized: {
                en: employee.currentRole.company.name
              }
            },
            title: {
              localized: {
                en: employee.currentRole.title
              }
            },
            startMonthYear: {
              month: employee.currentRole.startDate.month,
              year: employee.currentRole.startDate.year
            },
            location: {
              countryCode: employee.currentRole.office.country,
              regionCode: employee.currentRole.office.state
            }
          },
          offerId: hyperid(),
          offerCreationDate: now,
          offerExpirationDate: addWeeks(now, 2)
        }]
      }
      case "PastEmploymentPosition": {
        return employee.priorRoles.map(role => ({
          type: ["PastEmploymentPosition"],
          issuer: {vendorOrganizationId},
          credentialSubject: {
            vendorUserId,
            company: role.company.did,
            companyName: {
              localized: {
                en: role.company.name
              }
            },
            title: {
              localized: {
                en: role.title
              }
            },
            startMonthYear: {
              month: role.startDate.month,
              year: role.startDate.year
            },
            endMonthYear: {
              month: role.endDate.month,
              year: role.endDate.year
            },
            location: {
              countryCode: role.office.country,
              regionCode: role.office.state
            }
          },
          offerId: hyperid(),
          offerCreationDate: now,
          offerExpirationDate: addWeeks(now, 2)
        }))
      }
      default:
        return [];
    }
  });
}

module.exports = function (fastify, opts, next) {
  fastify.post(
    '/identify',
    {schema: {body: requestSchema, responseSchemas}},
    async (request) => {
      const user = await identify(request.body);
      if (user == null) {
        throw newError.NotFound('User could not be found')
      }
      return {vendorUserId: user.id};
    }
  )

  fastify.post(
    '/generate-offers',
    // {schema: {body: requestSchema, responseSchemas}},
    async (request) => {
      const user = await findById(request.body.vendorUserId);
      if (user == null) {
        // Creates a 404 error response
        throw newError.NotFound(`Employee ${request.body.vendorUserId} could not be found`)
      }
      const offers = generateEmployeeOffers(user, request.body);
      return {offers};
    }
  )

  next()
}
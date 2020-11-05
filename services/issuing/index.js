const newError = require('http-errors');
const {createHash} = require('crypto')
const { v4: uuidv4 } = require('uuid')
const {addWeeks} = require('date-fns/fp')
const {first} = require('lodash/fp')
const {findByEmail, findByHashedPhone, findById} = require('./user-repo');
const phoneSalt = 'E69C43DAE85C4BF7EC69CCD5D7485'; // 256bit salt

function identify(idDocument) {
  if (first(idDocument.emails) != null) {
    return findByEmail(first(idDocument.emails));
  } else if (first(idDocument.phones) != null) {
    const hashedPhone = createHash('sha256').update(`${phoneSalt}${first(idDocument.phones)}`).digest('base64');
    return findByHashedPhone(hashedPhone);
  }

  return null;
}

function generateOffer({type, exchangeId, vendorOrganizationId, vendorUserId}, content) {
  const now = new Date();
  return {
    type: [type],
    issuer: {vendorOrganizationId},
    credentialSubject: {
      vendorUserId,
      ...content
    },
    offerId: uuidv4(),
    offerCreationDate: now,
    offerExpirationDate: addWeeks(2, now),
    exchangeId
  };
}

function generateEmployeeOffers(
  employee,
  {
    type: types = ['CurrentEmploymentPosition', 'PastEmploymentPosition'],
    ...metadata
  }) {
  return types.flatMap((type) => {
    switch (type) {
      case 'CurrentEmploymentPosition': {
        return [
          generateOffer(
            {type, ...metadata},
            {
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
            }
          )
        ]
      }
      case 'PastEmploymentPosition': {
        return employee.priorRoles
          .map(role =>
            generateOffer(
              {type, ...metadata},
              {
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
              })
          )
      }
      default:
        return [];
    }
  })
    ;
}

module.exports = function (fastify, opts, next) {
  fastify.post(
    '/identify',
    async (request) => {
      const user = await identify(request.body);
      if (user == null) {
        throw newError.NotFound('User could not be found')
      }
      return {vendorUserId: user.id};
    }
  );

  fastify.post(
    '/generate-offers',
    async (request) => {
      const user = await findById(request.body.vendorUserId);
      if (user == null) {
        // Creates a 404 error response
        throw newError.NotFound(`Employee ${request.body.vendorUserId} could not be found`)
      }
      const offers = generateEmployeeOffers(user, request.body);
      return {offers};
    }
  );

  next();
}
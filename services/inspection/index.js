const {first} = require('lodash/fp');
const {findOrCreateApplicant} = require('../applicants/applicant-repo');
const {saveApplicantCredentials} = require('../applicants/credential-repo');

module.exports = function (fastify, opts, next) {
  fastify.post(
    '/receive-checked-credentials',
    async (req) => {
      const credentials = req.body.credentials;

      // Extract the idAndContact credential and then find or create the applicant
      const idAndContact = credentials.find(c => c.type.includes('IdentityAndContact'));
      const applicant = findOrCreateApplicant(
        first(idAndContact.emails),
        {
          givenName: idAndContact.firstName,
          surname: idAndContact.lastName,
          emails: idAndContact.emails
        }
      );

      // Extract the career credential and save them against the applicant
      const careerCredentials = credentials.find(c => !c.type.includes('IdentityAndContact'));
      saveApplicantCredentials(applicant, careerCredentials);
      return {numProcessed: credentials.length};
    }
  );

  next();
}



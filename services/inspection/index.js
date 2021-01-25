const {difference, get, size} = require('lodash/fp');
const {findOrCreateApplicant} = require('../applicants/applicant-repo');
const {saveApplicantCredentials} = require('../applicants/credential-repo');

module.exports = function (fastify, opts, next) {
  fastify.post(
    '/receive-checked-credentials',
    async (req) => {
      const credentials = req.body.credentials;

      // Extract the idAndContact credential and then find or create the applicant
      const idDoc = get('credentialSubject', credentials.find(c => c.type.includes('IdDocument')));
      const {email} = get('credentialSubject', credentials.find(c => c.type.includes('Email')));
      const applicant = findOrCreateApplicant(
        email,
        {
          givenName: idDoc.firstName,
          surname: idDoc.lastName,
          email
        }
      );

      // Extract the career credential and save them against the applicant
      const careerCredentials = credentials.filter(c => size(difference(c.type, ['IdDocument', 'Email', 'Phone'])));
      saveApplicantCredentials(applicant, careerCredentials);
      return {numProcessed: credentials.length};
    }
  );

  next();
}



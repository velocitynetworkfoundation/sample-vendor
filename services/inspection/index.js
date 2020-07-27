const {findOrCreateApplicant, findApplicantById} = require("../applicants/applicant-repo");
const {saveApplicantCredentials} = require("../applicants/credential-repo");

module.exports = function (fastify, opts, next) {
  fastify.post(
    '/find-or-create-applicant',
    async (req) => {
      const idAndContact = req.body;
      const applicant = findOrCreateApplicant(idAndContact.email, {
        givenName: idAndContact.firstName,
        surname: idAndContact.lastName,
        email: idAndContact.email
      });
      return {vendorApplicantId: applicant.id};
    }
  );

  fastify.post(
    '/add-credentials-to-applicant',
    async (req) => {
      const applicant = findApplicantById(req.body.vendorApplicantId);
      const credentials = saveApplicantCredentials(applicant, req.body.credentials);
      return {numProcessed: credentials.length};
    }
  );

  next();
}



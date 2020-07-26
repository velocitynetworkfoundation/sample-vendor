const {insertApplicant, saveApplicantCredentials, findApplicantById, findApplicantByEmail} = require("../applicants/applicant-repo")

function createApplicant({vendorOriginContext, vendorOrganizationId, ...idAndContact}) {
  const applicant = findApplicantByEmail(idAndContact.email);
  if (applicant != null) {
    return applicant;
  }

  return insertApplicant({
    givenName: idAndContact.firstName,
    surname: idAndContact.lastName,
    email: idAndContact.email
  })
}

module.exports = function (fastify, opts, next) {
  fastify.post(
    '/find-or-create-applicant',
    async (req) => {
      const applicant = createApplicant(req.body);
      return {vendorApplicantId: applicant.id};
    }
  )

  fastify.post(
    '/add-credentials-to-applicant',
    async (req) => {
      const applicant = findApplicantById(req.body.vendorApplicantId);
      const credentials = saveApplicantCredentials(applicant, req.body.credentials);
      return {numProcessed: credentials.length};
    }
  )

  next();
}



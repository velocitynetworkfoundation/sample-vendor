const newError = require("http-errors");
const _ = require('lodash/fp');
const {findApplicantById} = require("./applicant-repo");
const {findApplicantCredentialsByApplicantId} = require("./credential-repo");

module.exports = function (fastify, opts, next) {
  fastify.get(`/:id`, {schema: {params: {id: {type: "string"}}}}, async (req) => {
    req.log.info(`get ${req.params.id}`)
    const applicant = findApplicantById(req.params.id);
    if (applicant == null) {
      throw newError.NotFound(`applicant ${req.params.id} not found`)
    }
    const credentials = findApplicantCredentialsByApplicantId(req.params.id);
    return {
      ...applicant,
      credentials: _.map(_.omit(["applicantId"]), credentials)
    };
  });

  next();
}
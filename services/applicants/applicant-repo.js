const hyperid = require('hyperid')({urlSafe: true});
const _ = require("lodash/fp");

const applicantsStore = {};
const credentialsStore = {};
const applicantCredentialIdStore = {};

function findApplicantById(id) {
  return applicantsStore[id];
}

function findApplicantByEmail(email) {
  return _.find({email}, _.values(applicantsStore))
}

function insertApplicant(applicant) {
  const id = hyperid();
  const createdApplicant = {id, ...applicant};
  applicantsStore[id] = createdApplicant;
  return createdApplicant;
}

function saveApplicantCredentials(applicant, credentials) {
  const applicantCredentials = _.map(credential => ({
    id: hyperid(),
    applicantId: applicant.id,
    ...credential
  }), credentials);

  applicantCredentialIdStore[applicant.id] = _.map('id', applicantCredentials);

  _.forEach(credential => {
    credentialsStore[credential.id] = credential
  }, applicantCredentials);
  return applicantCredentials;
}

function findApplicantCredentialsByApplicantId(applicantId) {
  return _.map(
    credentialId => credentialsStore[credentialId], applicantCredentialIdStore[applicantId]
  )
}

module.exports = {insertApplicant, saveApplicantCredentials, findApplicantCredentialsByApplicantId, findApplicantById, findApplicantByEmail}
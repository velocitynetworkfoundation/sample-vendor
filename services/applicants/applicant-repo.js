const { v4: uuidv4 } = require('uuid');
const _ = require("lodash/fp");

const applicantsStore = {};
let latestApplicant;

function findApplicantById(id) {
  return applicantsStore[id];
}

function findApplicantByEmail(email) {
  return _.find({email}, _.values(applicantsStore))
}

function findLatestApplicant() {
  return latestApplicant;
}

function findOrCreateApplicant(email, newApplicant) {
  const applicant = findApplicantByEmail(email);
  if (applicant != null) {
    // optionally update the applicant
    return applicant;
  }

  return insertApplicant(newApplicant)
}

function insertApplicant(applicant) {
  const id = uuidv4();
  const createdApplicant = {id, ...applicant};
  applicantsStore[id] = createdApplicant;
  latestApplicant = createdApplicant;
  return createdApplicant;
}

module.exports = {insertApplicant, findApplicantById, findLatestApplicant, findApplicantByEmail, findOrCreateApplicant}
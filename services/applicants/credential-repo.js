const { v4: uuidv4 } = require('uuid');
const _ = require("lodash/fp");

const educationStore = {};
const employmentStore = {};
const applicantCredentialIdIndex = {};

function educationMapper(velocityEducation, checks) {
  return {
    id: uuidv4(),
    applicantId: velocityEducation.applicantId,
    schoolName: velocityEducation.credentialSubject.schoolName.localized.en,
    degree: `${velocityEducation.credentialSubject.degreeName.localized.en} ${velocityEducation.credentialSubject.program.localized.en}`,
    startDate: new Date(velocityEducation.credentialSubject.startMonthYear.year, velocityEducation.credentialSubject.startMonthYear.month),
    endDate: new Date(velocityEducation.credentialSubject.endMonthYear.year, velocityEducation.credentialSubject.endMonthYear.month)
  };
}

function employmentMapper(velocityEmployment, checks) {
  console.error(velocityEmployment);
  const currentEmploymentRecord = {
    id: uuidv4(),
    applicantId: velocityEmployment.applicantId,
    companyName: velocityEmployment.credentialSubject.companyName.localized.en,
    position: velocityEmployment.credentialSubject.title.localized.en,
    startDate: new Date(velocityEmployment.credentialSubject.startMonthYear.year, velocityEmployment.credentialSubject.startMonthYear.month)
  };

  if (velocityEmployment.endDate == null) {
    return currentEmploymentRecord;
  }

  return {
    ...currentEmploymentRecord,
    endDate: new Date(velocityEmployment.endMonthYear.year, velocityEmployment.endMonthYear.month),
  };
}

function saveApplicantCredentials(applicant, credentials) {
  const applicantCredentials = _.map(credential => ({
    applicantId: applicant.id,
    kind: _.first(credential.type) === 'EducationDegree' ? 'Education' : 'Employment',
    ...credential
  }), credentials);

  applicantCredentialIdIndex[applicant.id] = _.map(credential => ({
    id: credential.id,
    kind: credential.kind
  }), applicantCredentials);

  _.forEach(credential => {
    if (credential.kind === 'Employment') {
      employmentStore[credential.id] = employmentMapper(credential);
    } else if (credential.kind === 'Education') {
      educationStore[credential.id] = educationMapper(credential);
    }
  }, applicantCredentials);
  return applicantCredentials;
}

function findApplicantCredentialsByApplicantId(applicantId) {
  return _.flow(_.map(
    ({id, kind}) => {
      if (kind === 'Employment') {
        return employmentStore[id];
      } else if (kind === 'Education') {
        return educationStore[id];
      } else {
        return []
      }
    }), _.compact)(applicantCredentialIdIndex[applicantId])
}

module.exports = {saveApplicantCredentials, findApplicantCredentialsByApplicantId}
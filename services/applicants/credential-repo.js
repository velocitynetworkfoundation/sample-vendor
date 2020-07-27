const hyperid = require('hyperid')({urlSafe: true});
const _ = require("lodash/fp");

const educationStore = {};
const employmentStore = {};
const applicantCredentialIdIndex = {};

function educationMapper(velocityEducation, checks) {
  return {
    id: hyperid(),
    applicantId: velocityEducation.applicantId,
    schoolName: velocityEducation.credentialSubject.schoolName.localized.en,
    degree: `${velocityEducation.credentialSubject.degreeName.localized.en} ${velocityEducation.credentialSubject.program.localized.en}`,
    startDate: new Date(velocityEducation.credentialSubject.startMonthYear.year, velocityEducation.credentialSubject.startMonthYear.month),
    endDate: new Date(velocityEducation.credentialSubject.endMonthYear.year, velocityEducation.credentialSubject.endMonthYear.month)
  };
}

function employmentMapper(velocityEmployment, checks) {
  const currentEmploymentRecord = {
    id: hyperid(),
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
    switch (credential.kind) {
      case 'Employment': {
        employmentStore[credential.id] = employmentMapper(credential);
        break;
      }
      case 'Education': {
        educationStore[credential.id] = educationMapper(credential);
        break;
      }
    }
  }, applicantCredentials);
  return applicantCredentials;
}

function findApplicantCredentialsByApplicantId(applicantId) {
  return _.map(
    ({id, kind}) => {
      switch (kind) {
        case 'Employment': {
          return employmentStore[id]
        }
        case 'Education': {
          return educationStore[id]
        }
      }
    }, applicantCredentialIdIndex[applicantId]
  )
}

module.exports = {saveApplicantCredentials, findApplicantCredentialsByApplicantId}
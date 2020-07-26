const _ = require("lodash/fp")
const hyperid = require("hyperid")({urlSafe: true});

const userStore = Object.freeze({
  "1": {
    email: "adam.smith@example.com",
    currentRole: {
      company: {did: 'did:ethr:acme', name: 'ACME Corp'},
      title: 'CEO',
      startDate: {month: 1, year: 2015},
      office: {country: 'US', state: 'CA'}
    },
    priorRoles: [
      {
        company: {did: 'did:ethr:acme', name: 'ACME Corp'},
        title: 'Head of Product',
        startDate: {month: 1, year: 2005},
        endDate: {month: 12, year: 2014},
        office: {country: 'US', state: 'CA'}
      }
    ]
  },
  "2": {
    email: "olivia.hafez@example.com",
    hashedPhone: "mDlNtQd87QNA+6tvwC+E6kVaxjc9m136YjDcrUGl8Uk=",
    currentRole: {
      company: {did: 'did:ethr:acme', name: 'ACME Corp'},
      title: 'Senior Engineer',
      startDate: {month: 1, year: 2018},
      office: {country: 'US', state: 'CA'}
    },
    priorRoles: []
  }
});

function findUser(matcher) {
  const pair = _.flow(
    _.toPairs,
    _.find(pairs => _.isMatch(matcher, pairs[1]))
  )(userStore)


  if (pair == null) {
    return null;
  }

  return {
    id: pair[0],
    ..._.omit(["hashedPhone"], pair[1])
  }
}


function findByEmail(email) {
  return findUser({email})
}

function findByHashedPhone(hashedPhone) {
  return findUser({hashedPhone})
}

function findById(userId) {
  return userStore[userId];
}

module.exports = {findByEmail, findByHashedPhone, findById};
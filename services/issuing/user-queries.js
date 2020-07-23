const _ = require("lodash/fp")
const hyperid = require("hyperid")();

const users = Object.freeze({
  [hyperid()]: { email: "adam.smith@example.com" },
  [hyperid()]: { email: "olivia.hafez@example.com", hashedPhone:"mDlNtQd87QNA+6tvwC+E6kVaxjc9m136YjDcrUGl8Uk=" }
});

function findUser(matcher) {
  const pair = _.flow(
    _.toPairs,
    _.find(pairs => _.isMatch(matcher, pairs[1]))
  )(users)


  if (pair == null) {
    return null;
  }

  return {
    id: pair[0],
    ..._.omit(["hashedPhone"], pair[1])
  }
}


function findByEmail(email) {
  return findUser({ email })
}

function findByHashedPhone(hashedPhone) {
  return findUser({ hashedPhone })
}

module.exports = { findByEmail, findByHashedPhone };
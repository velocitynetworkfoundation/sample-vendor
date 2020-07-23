const newError = require("http-errors");
const { createHash } = require('crypto')
const { findByEmail, findByHashedPhone } = require("./user-queries");
const { requestSchemas, responseSchemas } = require("./identify-schemas")
const phoneSalt = 'E69C43DAE85C4BF7EC69CCD5D7485'; // 256bit salt

function identify(idDocument) {
  if (idDocument.email != null) {
    return findByEmail(idDocument.email);
  } else if (idDocument.phone != null) {
    const hashedPhone = createHash('sha256').update(`${phoneSalt}${idDocument.phone}`).digest('base64');
    return findByHashedPhone(hashedPhone);
  }

  return null;
}

module.exports = function (fastify, opts, next) {
  fastify.post(
    '/issuing/identify',
    async (request) => {
      const user = await identify(request.body);
      if (user == null) {
        throw newError.NotFound('User could not be found')
      }
      return {vendorUserId: user.id};
    }
  )

  next()
}
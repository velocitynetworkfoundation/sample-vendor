'use strict'

const fs = require('fs')
const path = require('path')
const AutoLoad = require('fastify-autoload')

module.exports = function (fastify, opts, next) {
  // Place here your custom code!
  const dirPath = path.join(__dirname, 'schemas');
  const fileNames = fs.readdirSync(dirPath);
  fileNames.forEach(fileName => {
    const fileContent = fs.readFileSync(`${dirPath}/${fileName}`, {encoding: 'utf-8'});
    fastify.addSchema(JSON.parse(fileContent))
  });

  // This loads all plugins defined in services
  // define your routes in one of these
  fastify
    // .register(require('fastify-sensible'))
    .register(require('fastify-routes'))
    .register(AutoLoad, {
      dir: path.join(__dirname, 'services')
    })

  next()
}

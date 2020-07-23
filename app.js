'use strict'

const fs = require('fs')
const path = require('path')
const AutoLoad = require('fastify-autoload')

module.exports = function (fastify, opts, next) {

  fastify.register(require('fastify-routes'))

  // Place here your custom code!
  const dirPath = path.join(__dirname, 'schemas');
  const fileNames = fs.readdirSync(dirPath);
  fileNames.forEach(fileName => {
    const fileContent = fs.readFileSync(`${dirPath}/${fileName}`, {encoding: 'utf-8'});
    fastify.addSchema(JSON.parse(fileContent))
  });

  // Do not touch the following lines

  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  // fastify.register(AutoLoad, {
  //   dir: path.join(__dirname, 'plugins')
  // })

  // This loads all plugins defined in services
  // define your routes in one of these
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'services')
  })

  // Make sure to call next when done

  next()
}

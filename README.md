# Sample Vendor

A sample implementation of the [Vendor Gateway API](https://docs.velocitynetwork.foundation/docs/vendor-gateway-api)
for a Credential Agent, using fastify v3.

## Getting started
1. Run the following
```sh
$ docker-compose pull # get the latest images
$ docker-compose up
```

**DO NOT RUN IN PRODUCTION WITHOUT CHANGING SECRET VALUES**

### Using npm
```sh
$ npm install
$ npm start
```

### Using yarn
```sh
$ yarn
$ yarn start
```

## Issuing endpoints
See /services/issuing

## Inspection endpoints
See /services/inspection

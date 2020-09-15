# Sample Vendor

Is an example implementation of a Vendor Gateway API for a Credential Agent that for the Luther release, using fastify v3.

## Getting started
1. Update the secretes in the .env file
2. Run the following
```sh
$ docker-compose pull # get the latest images
$ docker-compose up
```

*This has been tested on Version 19 of docker and 1.26 of docker-compose. Your mileage may vary on other versions.*

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

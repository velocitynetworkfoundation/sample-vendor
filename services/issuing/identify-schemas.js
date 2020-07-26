const error = require("../../schemas/error")

const requestSchema = {
  "type": "object",
  "$id": "#identityAndContact",
  "properties": {
    "firstName": {
      "$ref": "multilingual-string#"
    },
    "middleNames": {
      "$ref": "multilingual-string#"
    },
    "lastName": {
      "$ref": "multilingual-string#"
    },
    "address": {
      "$ref": "address#"
    },
    "dob": {
      "$ref": "date#"
    },
    "emails": {
      "type": "array",
      "items": {"type": "string", "format": "email"}
    },
    "phones": {
      "type": "array",
      "items": {"type": "string"}
    },
    "identityCredentials": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "kind": {
            "type": "string",
            "description": "DriversLicense, IdCard, SSN, NI Number, etc"
          },
          "authority": {
            "type": "string",
            "description": "name of the issuing authority"
          },
          "authorityId": {
            "type": "string",
            "description": "DID id of the issuing authority"
          },
          "location": {
            "$ref": "location#"
          },
          "identityNumber": {
            "type": "string",
            "description": "The id number of the identity credential"
          },
          "firstName": {
            "$ref": "multilingual-string#"
          },
          "middleNames": {
            "$ref": "multilingual-string#"
          },
          "lastName": {
            "$ref": "multilingual-string#"
          },
          "address": {
            "$ref": "address#"
          },
          "dob": {
            "$ref": "date#"
          }
        }
      }
    },
    "vendorOrganizationId": {
      "type": "string",
      "description": "The organization that is identifying the person"
    },
    "exchangeId": {
      "type": "string",
      "format": "uuid",
      "description": "if associated to an issuing attempt then exchangeId should be set. exchangeId is unique for each issuing attempt"
    }
  },
  "required": [
    "vendorOrganizationId"
  ]
};
const responseSchemas = {
  "200": {
    "type": "object",
    "properties": {
      "vendorUserId": {
        "type": "string",
        "description": "JWT token used for authorizing the user"
      }
    }
  },
  "400": error,
  "404": error,
  "500": error
};

module.exports = {
  requestSchema, responseSchemas
}
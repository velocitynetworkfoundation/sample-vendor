const error = require("../../schemas/error")

const requestSchema = {
  "type": "object",
  "$id": "#identityAndContact",
  "definitions": {
    "id-document": {
      "title": "id-document",
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
        "location": "location#",
        "identityNumber": {
          "type": "string",
          "description": "The id number of the identity credential"
        },
        "firstName": "multilingual-string#",
        "lastName": "multilingual-string#",
        "middleNames": "multilingual-string#",
        "address": "address#",
        "dob": "date#"
      }
    },
    "issuer-data": {
      "title": "issuer-data",
      "type": "object",
      "properties": {
        "email": {
          "type": "string",
          "format": "email"
        },
        "issuer": {
          "type": "string"
        },
        "issued": {
          "type": "string",
          "format": "date-time"
        },
        "validFrom": {
          "type": "string",
          "format": "date-time"
        },
        "validUntil": {
          "type": "string",
          "format": "date-time"
        }
      }
    }
  },
  "properties": {
    "firstName": "multilingual-string#",
    "lastName": "multilingual-string#",
    "middleNames": "multilingual-string#",
    "address": "address#",
    "dob": "date#",
    "emails": {
      "type": "array",
      "items": {
        "type": "string",
        "format": "email"
      }
    },
    "phones": {
      "type": "array",
      "items": {
        "type": "string"
      }
    },
    "emailCredentials": {
      "type": "array",
      "items": {
        "type": "object",
        "allOf": ["issuer-data#","email#"
        ]
      }
    },
    "phoneCredentials": {
      "type": "array",
      "items": {
        "type": "object",
        "allOf": [
          "issuer-data#",
          "phone-number#"
        ]
      }
    },
    "idDocumentCredentials": {
      "type": "array",
      "items": {
        "allOf": ["id-document#", "issuer-data#"]
      }
    },
    "exchangeId": {
      "type": "string",
      "description": "if associated to an issuing attempt then exchangeId should be set. exchangeId is unique for each issuing attempt"
    },
    "vendorOrganizationId": {
      "type": "string"
    }
  },
  "required": ["vendorOrganizationId", "exchangeId"]
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
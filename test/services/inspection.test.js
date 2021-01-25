'use strict'
const _ = require("lodash/fp");
const {v4: uuidv4} = require('uuid');
const {test, only} = require('tap')
const {build} = require('../helper')

const UUID_FORMAT = /^[a-z0-9A-Z-_]+$/;
const ISO_DATE_FORMAT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

const vendorOrganizationId = uuidv4();

const idCred = {
  type: ["IdDocument"],
  issuer: {
    id: 'did.ethr:acme'
  },
  credentialSubject: {
    firstName: { localized: {en: 'Adam'}},
    lastName: { localized: {en: 'Smith'}},
  },
  issuanceDate: "2020-06-30T07:20:03Z",
  id: "did:ethr:0xf12378ae3424c23b13983214",
  credentialChecks: [{kind: 'ISSUER_CHAIN', value: 'PASS'}]
};

const emailCred = {
  type: ["Email"],
  issuer: {
    id: 'did.ethr:acme'
  },
  credentialSubject: {
    email: "adam.smith@example.com"
  },
  issuanceDate: "2020-06-30T07:20:03Z",
  id: "did:ethr:0xf12378ae3424c23b13983215",
  credentialChecks: [{kind: 'ISSUER_CHAIN', value: 'PASS'}]
}


const phoneCred = {
  type: ["Phone"],
  issuer: {
    id: 'did.ethr:acme'
  },
  credentialSubject: {
    phone: "+972543142123"
  },
  issuanceDate: "2020-06-30T07:20:03Z",
  id: "did:ethr:0xf12378ae3424c23b13983216",
  credentialChecks: [{kind: 'ISSUER_CHAIN', value: 'PASS'}]
}

test(`create applicant test`, async (t) => {
  const app = build(t)

  const findOrCreateResponse = await app.inject({
    url: '/inspection/receive-checked-credentials',
    method: "POST",
    headers: {
      "Content-type": "application/json"
    },
    payload: JSON.stringify({credentials: [idCred, emailCred], vendorOrganizationId})
  })

  t.equal(findOrCreateResponse.statusCode, 200)

  const getResponse = await app.inject({
    url: `/applicants/latest`,
    method: 'GET'
  })
  t.equal(getResponse.statusCode, 200)
  t.match(JSON.parse(getResponse.payload), {
    id: UUID_FORMAT,
    givenName: idCred.credentialSubject.firstName,
    surname: idCred.credentialSubject.lastName,
    email: emailCred.credentialSubject.email,
    credentials: []
  })
})

test(`find applicant test`, async (t) => {
  const app = build(t)

  const createResponse = await app.inject({
    url: '/inspection/receive-checked-credentials',
    method: "POST",
    headers: {
      "Content-type": "application/json"
    },
    payload: JSON.stringify({credentials: [idCred, emailCred, phoneCred], vendorOrganizationId})
  })

  t.equal(createResponse.statusCode, 200)
  const getApplicant1Response = await app.inject({
    url: `/applicants/latest`,
    method: 'GET'
  })

  t.match(getApplicant1Response.statusCode, 200);
  const createJson = JSON.parse(getApplicant1Response.payload);

  const findResponse = await app.inject({
    url: '/inspection/receive-checked-credentials',
    method: "POST",
    headers: {
      "Content-type": "application/json"
    },
    payload: JSON.stringify({credentials: [idCred, emailCred, phoneCred], vendorOrganizationId})
  })

  t.equal(findResponse.statusCode, 200)

  const getApplicant2Response = await app.inject({
    url: `/applicants/latest`,
    method: 'GET'
  })

  t.match(getApplicant2Response.statusCode, 200);
  const findJson = JSON.parse(getApplicant2Response.payload);
  t.same(findJson, createJson);
})

test(`create applicant & attach credentials test test`, async (t) => {
  const credentials = [{
    type: ["PreviousEmploymentPosition"],
    issuer: {
      id: 'did.ethr:acme'
    },
    credentialSubject: {
      company: 'did:ethr:acme',
      companyName: {localized: {en: 'ACME Corp'}},
      title: {localized: {en: 'Head of Product'}},
      startMonthYear: {month: 1, year: 2005},
      endMonthYear: {month: 12, year: 2014},
      office: {country: 'US', state: 'CA'},
    },
    issuanceDate: "2020-06-30T07:20:03Z",
    id: "did:ethr:0xf12378ae3424c23b13983214",
    credentialChecks: [{kind: 'ISSUER_CHAIN', value: 'PASS'}]
  }];
  const app = build(t)

  const response = await app.inject({
    url: '/inspection/receive-checked-credentials',
    method: "POST",
    headers: {
      "Content-type": "application/json"
    },
    payload: JSON.stringify({credentials: credentials.concat([idCred, emailCred]), vendorOrganizationId})
  })

  t.equal(response.statusCode, 200)
  const addCredentialsJson = JSON.parse(response.payload);
  t.match(addCredentialsJson, {numProcessed: 3});

  const getResponse = await app.inject({
    url: `/applicants/latest`,
    method: 'GET'
  })
  t.equal(getResponse.statusCode, 200)
  t.match(JSON.parse(getResponse.payload), {
    id: UUID_FORMAT,
    givenName: idCred.credentialSubject.firstName,
    surname: idCred.credentialSubject.lastName,
    email: emailCred.credentialSubject.email,
    credentials: [{
      id: UUID_FORMAT,
      companyName: _.first(credentials).credentialSubject.companyName.localized.en,
      position: _.first(credentials).credentialSubject.title.localized.en
    }]
  })
})
'use strict'

const hyperid = require('hyperid')();
const {test} = require('tap')
const {build} = require('../helper')

const HYPER_ID = /^[a-z0-9A-Z-_]+$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

const newApplicant = {
  firstName: 'Adam',
  lastName: "Smith",
  email: "adam.smith@example.com",
  phone: '+972543142123',
  vendorOrganizationId: hyperid()
};

test(`create applicant test`, async (t) => {
  const app = build(t)

  const findOrCreateResponse = await app.inject({
    url: '/inspection/find-or-create-applicant',
    method: "POST",
    headers: {
      "Content-type": "application/json"
    },
    payload: JSON.stringify(newApplicant)
  })

  t.equal(findOrCreateResponse.statusCode, 200)
  const findOrCreateJson = JSON.parse(findOrCreateResponse.payload);
  t.match(findOrCreateJson, {vendorApplicantId: HYPER_ID});

  const getResponse = await app.inject({
    url: `/applicants/${findOrCreateJson.vendorApplicantId}`,
    method: 'GET'
  })
  t.equal(getResponse.statusCode, 200)
  t.same(JSON.parse(getResponse.payload), {
    id: findOrCreateJson.vendorApplicantId,
    givenName: newApplicant.firstName,
    surname: newApplicant.lastName,
    email: newApplicant.email,
    credentials: []
  })
})

test(`find applicant test`, async (t) => {
  const app = build(t)

  const createResponse = await app.inject({
    url: '/inspection/find-or-create-applicant',
    method: "POST",
    headers: {
      "Content-type": "application/json"
    },
    payload: JSON.stringify(newApplicant)
  })

  t.equal(createResponse.statusCode, 200)
  const createJson = JSON.parse(createResponse.payload);
  t.match(createJson, {vendorApplicantId: HYPER_ID});
  console.info(JSON.stringify(createJson))

  const findResponse = await app.inject({
    url: '/inspection/find-or-create-applicant',
    method: "POST",
    headers: {
      "Content-type": "application/json"
    },
    payload: JSON.stringify(newApplicant)
  })

  t.equal(findResponse.statusCode, 200)
  const findJson = JSON.parse(findResponse.payload);
  console.info(JSON.stringify(findJson))
  t.same(findJson, createJson);
})


test(`create applicant & attach credentials test test`, async (t) => {
  const credentials = [{
    company: {did: 'did:ethr:acme', name: 'ACME Corp'},
    title: 'Head of Product',
    startDate: {month: 1, year: 2005},
    endDate: {month: 12, year: 2014},
    office: {country: 'US', state: 'CA'},
    checks: [{kind: 'ISSUER_CHAIN', value: 'PASS'}]
  }];
  const app = build(t)

  const findOrCreateResponse = await app.inject({
    url: '/inspection/find-or-create-applicant',
    method: "POST",
    headers: {
      "Content-type": "application/json"
    },
    payload: JSON.stringify(newApplicant)
  })
  const findOrCreateJson = JSON.parse(findOrCreateResponse.payload);
  const addCredentialsResponse = await app.inject({
    url: '/inspection/add-credentials-to-applicant',
    method: "POST",
    headers: {
      "Content-type": "application/json"
    },
    payload: JSON.stringify({credentials, vendorOrganizationId: newApplicant.vendorOrganizationId, ...findOrCreateJson})
  })

  t.equal(addCredentialsResponse.statusCode, 200)
  const addCredentialsJson = JSON.parse(addCredentialsResponse.payload);
  t.match(addCredentialsJson, {numProcessed: 1});

  const getResponse = await app.inject({
    url: `/applicants/${findOrCreateJson.vendorApplicantId}`,
    method: 'GET'
  })
  t.equal(getResponse.statusCode, 200)
  t.match(JSON.parse(getResponse.payload), {
    id: findOrCreateJson.vendorApplicantId,
    givenName: newApplicant.firstName,
    surname: newApplicant.lastName,
    email: newApplicant.email,
    credentials: credentials.map(credential => ({id: HYPER_ID, ...credential}))
  })
})
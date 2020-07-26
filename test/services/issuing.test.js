'use strict'

const hyperid = require('hyperid')();
const {test} = require('tap')
const {build} = require('../helper')

const DID = /^did:ethr:[a-z0-9A-Z]+$/
const HYPER_ID = /^[a-z0-9A-Z-_]+$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

test('issuing identify success using email', async (t) => {
  const app = build(t)

  const res = await app.inject({
    url: '/issuing/identify',
    method: "POST",
    headers: {
      "Content-type": "application/json"
    },
    payload: JSON.stringify({
      email: "adam.smith@example.com",
      vendorOrganizationId: hyperid()
    })
  })

  t.equal(res.statusCode, 200)
  t.match(JSON.parse(res.payload), {vendorUserId: HYPER_ID})
})

test('issuing identify success using hashed phone', async (t) => {
  const app = build(t)

  const res = await app.inject({
    url: '/issuing/identify',
    method: "POST",
    headers: {
      "Content-type": "application/json"
    },
    payload: JSON.stringify({
      phone: "+447963587331",
      vendorOrganizationId: hyperid()
    })
  })

  t.equal(res.statusCode, 200)
  t.match(JSON.parse(res.payload), {vendorUserId: HYPER_ID})
})

test('issuing identify failure', async (t) => {
  const app = build(t)

  const res = await app.inject({
    url: '/issuing/identify',
    method: "POST",
    headers: {
      "Content-type": "application/json"
    },
    payload: JSON.stringify({
      email: "DOESNT.EXIST@example.com",
      vendorOrganizationId: hyperid()
    })
  })

  t.equal(res.statusCode, 404);
})


test('issuing selected offers', async (t) => {
  const app = build(t)

  const payload = {
    vendorUserId: "1",
    vendorOrganizationId: hyperid(),
    type: ["CurrentEmploymentPosition"]
  };

  const res = await app.inject({
    url: '/issuing/generate-offers',
    method: "POST",
    headers: {
      "Content-type": "application/json"
    },
    payload: JSON.stringify(payload)
  })

  t.equal(res.statusCode, 200)
  t.match(JSON.parse(res.payload), {
    offers: [{
      type: ["CurrentEmploymentPosition"],
      issuer: { vendorOrganizationId: payload.vendorOrganizationId },
      credentialSubject: {
        vendorUserId: payload.vendorUserId,
        company: DID,
        companyName: {
          localized: {
            en: "ACME Corp"
          }
        },
        title: {
          localized: {
            en: "CEO"
          }
        },
        startMonthYear: {
          month: 1,
          year: 2015
        },
        location: {
          countryCode: "US",
          regionCode: "CA"
        }
      },
      offerId: HYPER_ID,
      offerCreationDate: ISO_DATE,
      offerExpirationDate: ISO_DATE
    }]
  })
})


test('issuing all offers', async (t) => {
  const app = build(t)

  const payload = {
    vendorUserId: "1",
    vendorOrganizationId: hyperid()
  };

  const res = await app.inject({
    url: '/issuing/generate-offers',
    method: "POST",
    headers: {
      "Content-type": "application/json"
    },
    payload: JSON.stringify(payload)
  })

  t.equal(res.statusCode, 200)
  t.match(JSON.parse(res.payload), {
    offers: [{
      type: ["CurrentEmploymentPosition"],
      issuer: { vendorOrganizationId: payload.vendorOrganizationId },
      credentialSubject: {
        vendorUserId: payload.vendorUserId,
        company: DID,
        companyName: {
          localized: {
            en: "ACME Corp"
          }
        },
        title: {
          localized: {
            en: "CEO"
          }
        },
        startMonthYear: {
          month: 1,
          year: 2015
        },
        location: {
          countryCode: "US",
          regionCode: "CA"
        }
      },
      offerId: HYPER_ID,
      offerCreationDate: ISO_DATE,
      offerExpirationDate: ISO_DATE
    },
      {
        type: ["PastEmploymentPosition"],
        issuer: { vendorOrganizationId: payload.vendorOrganizationId },
        credentialSubject: {
          vendorUserId: payload.vendorUserId,
          company: DID,
          companyName: {
            localized: {
              en: "ACME Corp"
            }
          },
          title: {
            localized: {
              en: "Head of Product"
            }
          },
          startMonthYear: {
            month: 1,
            year: 2005
          },
          endMonthYear: {
            month: 12,
            year: 2014
          },
          location: {
            countryCode: "US",
            regionCode: "CA"
          }
        },
        offerId: HYPER_ID,
        offerCreationDate: ISO_DATE,
        offerExpirationDate: ISO_DATE
      }]
  })
})

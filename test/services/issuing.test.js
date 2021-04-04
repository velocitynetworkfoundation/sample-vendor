'use strict'

const {v4: uuidv4} = require('uuid');
const {test} = require('tap')
const {build} = require('../helper')

const DID_FORMAT = /^did:ethr:[a-z0-9A-Z]+$/
const UUID_FORMAT = /^[a-z0-9-_]+$/;
const ISO_DATE_FORMAT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

test('issuing identify success using email', async (t) => {
  const app = build(t)

  const res = await app.inject({
    url: '/issuing/identify',
    method: "POST",
    headers: {
      "Content-type": "application/json"
    },
    payload: JSON.stringify({
      emails: ["adam.smith@example.com"],
      vendorOrganizationId: uuidv4()
    })
  })

  t.equal(res.statusCode, 200)
  t.match(JSON.parse(res.payload), {vendorUserId: UUID_FORMAT})
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
      phones: ["+447963587331"],
      vendorOrganizationId: uuidv4()
    })
  })

  t.equal(res.statusCode, 200)
  t.match(JSON.parse(res.payload), {vendorUserId: UUID_FORMAT})
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
      vendorOrganizationId: uuidv4()
    })
  })

  t.equal(res.statusCode, 404);
})


test('issuing selected offers', async (t) => {
  const app = build(t)

  const payload = {
    vendorUserId: "1",
    vendorOrganizationId: uuidv4(),
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
      credentialSubject: {
        vendorUserId: payload.vendorUserId,
        company: DID_FORMAT,
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
      offerId: UUID_FORMAT,
      offerCreationDate: ISO_DATE_FORMAT,
      offerExpirationDate: ISO_DATE_FORMAT
    }]
  })
})


test('issuing all offers', async (t) => {
  const app = build(t)

  const payload = {
    vendorUserId: "1",
    vendorOrganizationId: uuidv4()
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
      credentialSubject: {
        vendorUserId: payload.vendorUserId,
        company: DID_FORMAT,
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
      offerId: UUID_FORMAT,
      offerCreationDate: ISO_DATE_FORMAT,
      offerExpirationDate: ISO_DATE_FORMAT
    },
      {
        type: ["PastEmploymentPosition"],
        credentialSubject: {
          vendorUserId: payload.vendorUserId,
          company: DID_FORMAT,
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
        offerId: UUID_FORMAT,
        offerCreationDate: ISO_DATE_FORMAT,
        offerExpirationDate: ISO_DATE_FORMAT
      }]
  })
})

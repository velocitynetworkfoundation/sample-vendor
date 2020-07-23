'use strict'

const { test } = require('tap')
const { build } = require('../helper')

test('issuing identify success using email', async (t) => {
  const app = build(t)

  const res = await app.inject({
    url: '/issuing/identify',
    method: "POST",
    headers: {
      "Content-type": "application/json"
    },
    payload: JSON.stringify({
      email: "adam.smith@example.com"
    })
  })

  t.equal(res.statusCode, 200)
  t.match(JSON.parse(res.payload), {vendorUserId: /^[0-9a-zA-Z/+]+$/})
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
      phone: "+447963587331"
    })
  })

  t.equal(res.statusCode, 200)
  t.match(JSON.parse(res.payload), {vendorUserId: /^[0-9a-zA-Z/+]+$/})
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
      email: "DOESNT.EXIST@example.com"
    })
  })

  t.equal(res.statusCode, 404);
})

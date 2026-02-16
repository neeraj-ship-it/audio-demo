import handler from '../../pages/api/health'

// Mock fs module so we don't need actual files on disk
jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
  },
}))

import fs from 'fs'

function createMockReqRes(method = 'GET') {
  const req = { method }
  const res = {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code
      return this
    },
    json(data) {
      this.body = data
      return this
    },
  }
  return { req, res }
}

describe('Health API endpoint', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return 200 with status "healthy" when database is accessible', async () => {
    fs.promises.readFile.mockResolvedValue(
      JSON.stringify({ stories: [{ id: 1, title: 'Test Story' }] })
    )

    const { req, res } = createMockReqRes('GET')
    await handler(req, res)

    expect(res.statusCode).toBe(200)
    expect(res.body.status).toBe('healthy')
  })

  it('should return correct fields (status, timestamp, uptime, version)', async () => {
    fs.promises.readFile.mockResolvedValue(
      JSON.stringify({ stories: [] })
    )

    const { req, res } = createMockReqRes('GET')
    await handler(req, res)

    expect(res.body).toHaveProperty('status')
    expect(res.body).toHaveProperty('timestamp')
    expect(res.body).toHaveProperty('uptime')
    expect(res.body).toHaveProperty('version')
  })

  it('should return a valid ISO timestamp', async () => {
    fs.promises.readFile.mockResolvedValue(
      JSON.stringify({ stories: [] })
    )

    const { req, res } = createMockReqRes('GET')
    await handler(req, res)

    const parsed = new Date(res.body.timestamp)
    expect(parsed.toISOString()).toBe(res.body.timestamp)
  })

  it('should return uptime as a number', async () => {
    fs.promises.readFile.mockResolvedValue(
      JSON.stringify({ stories: [] })
    )

    const { req, res } = createMockReqRes('GET')
    await handler(req, res)

    expect(typeof res.body.uptime).toBe('number')
  })

  it('should return 503 when database is not accessible', async () => {
    fs.promises.readFile.mockRejectedValue(new Error('File not found'))

    const { req, res } = createMockReqRes('GET')
    await handler(req, res)

    expect(res.statusCode).toBe(503)
    expect(res.body.status).toBe('degraded')
  })

  it('should return 405 for non-GET requests', async () => {
    const { req, res } = createMockReqRes('POST')
    await handler(req, res)

    expect(res.statusCode).toBe(405)
    expect(res.body.error).toBe('Method not allowed')
  })
})

import https from 'https'

const PROJECT_ID = 'tomwhats-sender'
const API_KEY = 'AIzaSyA1MppN3e7_QBlOX1gbcq3UivoHJax89_8'
const BASE = `firestore.googleapis.com`
const DB_PATH = `/v1/projects/${PROJECT_ID}/databases/(default)/documents`

function firestoreRequest(method: string, path: string, body?: object): Promise<any> {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify({ fields: toFields(body) }) : null
    const fullPath = `${DB_PATH}${path}?key=${API_KEY}`
    const headers: Record<string, string | number> = { 'Content-Type': 'application/json' }
    if (data) headers['Content-Length'] = Buffer.byteLength(data)

    const req = https.request({ hostname: BASE, path: fullPath, method, headers }, res => {
      let raw = ''
      res.on('data', c => raw += c)
      res.on('end', () => {
        try { resolve({ ok: res.statusCode! >= 200 && res.statusCode! < 300, status: res.statusCode, data: JSON.parse(raw) }) }
        catch (_) { resolve({ ok: false, status: res.statusCode, data: raw }) }
      })
    })
    req.on('error', reject)
    if (data) req.write(data)
    req.end()
  })
}

function toFields(obj: Record<string, any>): Record<string, any> {
  const fields: Record<string, any> = {}
  for (const [k, v] of Object.entries(obj)) {
    if (v === null || v === undefined) fields[k] = { nullValue: null }
    else if (typeof v === 'string') fields[k] = { stringValue: v }
    else if (typeof v === 'boolean') fields[k] = { booleanValue: v }
    else if (typeof v === 'number') fields[k] = { integerValue: String(v) }
  }
  return fields
}

function fromFields(fields: Record<string, any>): Record<string, any> {
  const obj: Record<string, any> = {}
  for (const [k, v] of Object.entries(fields)) {
    if ('stringValue' in v) obj[k] = v.stringValue
    else if ('booleanValue' in v) obj[k] = v.booleanValue
    else if ('integerValue' in v) obj[k] = Number(v.integerValue)
    else if ('nullValue' in v) obj[k] = null
    else if ('timestampValue' in v) obj[k] = v.timestampValue
  }
  return obj
}

export async function getLicenseDoc(key: string): Promise<Record<string, any> | null> {
  const res = await firestoreRequest('GET', `/licenses/${key}`)
  if (!res.ok || res.data.error) return null
  return fromFields(res.data.fields || {})
}

export async function claimLicense(key: string, machineId: string): Promise<boolean> {
  const updatePath = `/licenses/${key}?updateMask.fieldPaths=machine_id&updateMask.fieldPaths=claimed_at`
  const res = await firestoreRequest('PATCH', updatePath, {
    machine_id: machineId,
    claimed_at: new Date().toISOString()
  })
  return res.ok
}

export async function getAllLicenses(): Promise<Record<string, any>[]> {
  const res = await firestoreRequest('GET', '/licenses')
  if (!res.ok || !res.data.documents) return []
  return res.data.documents.map((doc: any) => {
    const id = doc.name.split('/').pop()
    return { id, ...fromFields(doc.fields || {}) }
  })
}

export async function createLicense(key: string, data: Record<string, any>): Promise<boolean> {
  const res = await firestoreRequest('PATCH', `/licenses/${key}`, data)
  return res.ok
}

export async function updateLicense(key: string, data: Record<string, any>): Promise<boolean> {
  const fields = Object.keys(data).map(f => `updateMask.fieldPaths=${f}`).join('&')
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ fields: toFields(data) })
    const path = `${DB_PATH}/licenses/${key}?${fields}&key=${API_KEY}`
    const headers: Record<string, string | number> = { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
    const req = https.request({ hostname: BASE, path, method: 'PATCH', headers }, res => {
      let raw = ''
      res.on('data', c => raw += c)
      res.on('end', () => resolve(res.statusCode! >= 200 && res.statusCode! < 300))
    })
    req.on('error', reject)
    req.write(body)
    req.end()
  })
}

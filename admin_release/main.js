const { app, BrowserWindow, ipcMain, clipboard } = require('electron')
const path = require('path')
const https = require('https')

const PROJECT = 'tomwhats-sender'
const API_KEY = 'AIzaSyA1MppN3e7_QBlOX1gbcq3UivoHJax89_8'
const FS_HOST = 'firestore.googleapis.com'
const FS_BASE = `/v1/projects/${PROJECT}/databases/(default)/documents`

function toFields(obj) {
  const f = {}
  for (const [k, v] of Object.entries(obj)) {
    if (v === null || v === undefined) f[k] = { nullValue: null }
    else if (typeof v === 'boolean') f[k] = { booleanValue: v }
    else if (typeof v === 'string') f[k] = { stringValue: v }
    else if (typeof v === 'number') f[k] = { integerValue: String(v) }
  }
  return f
}

function fromFields(fields) {
  const obj = {}
  for (const [k, v] of Object.entries(fields || {})) {
    if ('stringValue' in v) obj[k] = v.stringValue
    else if ('booleanValue' in v) obj[k] = v.booleanValue
    else if ('integerValue' in v) obj[k] = Number(v.integerValue)
    else if ('nullValue' in v) obj[k] = null
    else if ('timestampValue' in v) obj[k] = v.timestampValue
  }
  return obj
}

function fsReq(method, path, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null
    const headers = { 'Content-Type': 'application/json' }
    if (data) headers['Content-Length'] = Buffer.byteLength(data)
    const req = https.request(
      { hostname: FS_HOST, path: `${FS_BASE}${path}?key=${API_KEY}`, method, headers },
      res => {
        let raw = ''
        res.on('data', c => raw += c)
        res.on('end', () => {
          try { resolve({ ok: res.statusCode >= 200 && res.statusCode < 300, status: res.statusCode, data: JSON.parse(raw) }) }
          catch (_) { resolve({ ok: false, status: res.statusCode, data: raw }) }
        })
      }
    )
    req.on('error', reject)
    if (data) req.write(data)
    req.end()
  })
}

// IPC handlers
ipcMain.handle('fs-list', async () => {
  const res = await fsReq('GET', '/licenses', null)
  const docs = res.data.documents || []
  return docs.map(doc => ({ id: doc.name.split('/').pop(), ...fromFields(doc.fields) }))
})

ipcMain.handle('fs-create', async (_, { key, data }) => {
  const body = { fields: toFields(data) }
  const res = await fsReq('PATCH', `/licenses/${key}`, body)
  return { ok: res.ok, status: res.status, error: res.ok ? null : JSON.stringify(res.data) }
})

ipcMain.handle('fs-update', async (_, { key, data }) => {
  const fields = Object.keys(data).map(f => `updateMask.fieldPaths=${f}`).join('&')
  const body = { fields: toFields(data) }
  return new Promise((resolve, reject) => {
    const raw = JSON.stringify(body)
    const headers = { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(raw) }
    const req = https.request(
      { hostname: FS_HOST, path: `${FS_BASE}/licenses/${key}?${fields}&key=${API_KEY}`, method: 'PATCH', headers },
      res => {
        let d = ''
        res.on('data', c => d += c)
        res.on('end', () => resolve({ ok: res.statusCode >= 200 && res.statusCode < 300 }))
      }
    )
    req.on('error', reject)
    req.write(raw)
    req.end()
  })
})

ipcMain.handle('clipboard-write', (_, text) => {
  clipboard.writeText(text)
  return true
})

let win

function createWindow() {
  win = new BrowserWindow({
    width: 900,
    height: 620,
    resizable: true,
    autoHideMenuBar: true,
    title: 'TomWhatsBulk Keygen',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  })
  win.loadFile(path.join(__dirname, 'index.html'))
}

app.whenReady().then(createWindow)
app.on('window-all-closed', () => app.quit())

import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { app } from 'electron'
import { machineIdSync } from 'node-machine-id'
import { getLicenseDoc, claimLicense } from './firebase'

const licenseFile = path.join(app.getPath('userData'), 'license.json')

interface LicenseCache {
  firstLaunch: number
  activatedKey?: string
  machineId?: string
  keyType?: string
  expiresAt?: string
}

function readCache(): LicenseCache {
  try {
    if (fs.existsSync(licenseFile)) return JSON.parse(fs.readFileSync(licenseFile, 'utf-8'))
  } catch (_) {}
  const data: LicenseCache = { firstLaunch: Date.now() }
  fs.writeFileSync(licenseFile, JSON.stringify(data))
  return data
}

function saveCache(data: LicenseCache) {
  fs.writeFileSync(licenseFile, JSON.stringify(data))
}

export function getMachineId(): string {
  try { return machineIdSync(true) }
  catch (_) { return crypto.createHash('md5').update(process.env.COMPUTERNAME || 'unknown').digest('hex') }
}

export async function checkLicense(): Promise<{
  valid: boolean; trialExpired: boolean; hoursLeft: number; machineId: string; keyType?: string; demoHoursLeft?: number
}> {
  const machineId = getMachineId()
  const cache = readCache()

  if (cache.activatedKey && cache.machineId === machineId) {
    if (cache.keyType === 'demo' && cache.expiresAt) {
      const remaining = new Date(cache.expiresAt).getTime() - Date.now()
      if (remaining <= 0) return { valid: false, trialExpired: true, hoursLeft: 0, machineId, keyType: 'demo', demoHoursLeft: 0 }
      return { valid: true, trialExpired: false, hoursLeft: 0, machineId, keyType: 'demo', demoHoursLeft: remaining / 3600000 }
    }
    return { valid: true, trialExpired: false, hoursLeft: 0, machineId, keyType: 'full' }
  }

  const elapsed = Date.now() - cache.firstLaunch
  const hoursLeft = Math.max(0, 24 - elapsed / 3600000)
  if (hoursLeft === 0) return { valid: false, trialExpired: true, hoursLeft: 0, machineId }
  return { valid: true, trialExpired: false, hoursLeft, machineId }
}

export async function activateKey(key: string): Promise<{ success: boolean; error?: string }> {
  const machineId = getMachineId()
  const normalizedKey = key.toUpperCase().trim()
  try {
    const doc = await getLicenseDoc(normalizedKey)
    if (!doc) return { success: false, error: 'Key not found. Contact your vendor.' }
    if (!doc.active) return { success: false, error: 'This key has been revoked.' }
    if (doc.expires_at && new Date(doc.expires_at).getTime() < Date.now())
      return { success: false, error: 'This demo key has expired.' }
    if (doc.machine_id && doc.machine_id !== machineId)
      return { success: false, error: 'This key is already activated on another machine.' }

    await claimLicense(normalizedKey, machineId)

    const cache = readCache()
    cache.activatedKey = normalizedKey
    cache.machineId = machineId
    cache.keyType = doc.key_type || 'full'
    cache.expiresAt = doc.expires_at || undefined
    saveCache(cache)
    return { success: true }  } catch (e: any) {
    return { success: false, error: 'Network error. Check your internet connection.' }
  }
}

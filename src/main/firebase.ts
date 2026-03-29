// Supabase REST API wrapper — no SDK needed
export const SUPABASE_CONFIG = {
  url: 'https://lcjrzupdwanyzuyshqul.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxjanJ6dXBkd2FueXp1eXNocXVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4MDEwMjcsImV4cCI6MjA5MDM3NzAyN30.GUVYLkK2691gIeV9s2Wfs1gEzY-KXjQxn1dcdm9Q_uA',
}

const BASE = `${SUPABASE_CONFIG.url}/rest/v1`

const headers = {
  apikey: SUPABASE_CONFIG.anonKey,
  Authorization: `Bearer ${SUPABASE_CONFIG.anonKey}`,
  'Content-Type': 'application/json',
}

// Get a license key document from Supabase
export async function getLicenseDoc(key: string) {
  const res = await fetch(`${BASE}/licenses?key=eq.${encodeURIComponent(key)}&select=*`, {
    headers: { ...headers, Accept: 'application/vnd.pgrst.object+json' },
  })
  if (!res.ok) return null
  try {
    const doc = await res.json()
    return doc
  } catch {
    return null
  }
}

// Claim a key — bind it to this machine
export async function claimLicense(key: string, machineId: string) {
  const res = await fetch(`${BASE}/licenses?key=eq.${encodeURIComponent(key)}`, {
    method: 'PATCH',
    headers: { ...headers, Prefer: 'return=minimal' },
    body: JSON.stringify({
      machine_id: machineId,
      claimed_at: Date.now(),
      active: true,
    }),
  })
  return res.ok
}

const DEFAULT_BASE = ''
const baseUrl = import.meta.env.DEV
  ? '/api/$default'
  : (import.meta.env.VITE_API_BASE_URL as string) || DEFAULT_BASE

export type ApiError = {
  message: string
  status?: number
}

async function requestWithTimeout<T>(input: RequestInfo, init?: RequestInit, timeoutMs = 30000): Promise<T> {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(input, { ...init, signal: controller.signal })
    const txt = await res.text()
    let data: any = null
    try { data = txt ? JSON.parse(txt) : null } catch { data = { message: txt } }
    if (!res.ok) {
      const err: ApiError = { message: data?.message || res.statusText || 'Request failed', status: res.status }
      throw err
    }
    return data as T
  } catch (e: any) {
    if (e?.name === 'AbortError') throw { message: 'Request timed out' } as ApiError
    // propagate ApiError or wrap unknown
    if (e && e.message) throw e
    throw { message: String(e) } as ApiError
  } finally {
    clearTimeout(id)
  }
}

export async function getProfileFull(userId: string, opts?: { matches?: number; mastery?: number }) {
  const q: string[] = []
  if (opts?.matches) q.push(`matches=${encodeURIComponent(String(opts.matches))}`)
  if (opts?.mastery) q.push(`mastery=${encodeURIComponent(String(opts.mastery))}`)
  const qs = q.length ? `?${q.join('&')}` : ''
  return await requestWithTimeout<any>(`${baseUrl}/users/${encodeURIComponent(userId)}/profile-full${qs}`)
}

export async function getUser(userId: string) {
  return await requestWithTimeout<any>(`${baseUrl}/users/${encodeURIComponent(userId)}`)
}

export async function getRiotProfile(userId: string) {
  return await requestWithTimeout<any>(`${baseUrl}/users/${encodeURIComponent(userId)}/riot/profile`)
}

export async function getRanked(userId: string) {
  return await requestWithTimeout<any>(`${baseUrl}/users/${encodeURIComponent(userId)}/riot/ranked`)
}

export async function getMastery(userId: string, top?: number) {
  const qs = top ? `?top=${encodeURIComponent(String(top))}` : ''
  return await requestWithTimeout<any>(`${baseUrl}/users/${encodeURIComponent(userId)}/riot/mastery${qs}`)
}

export async function getMatches(userId: string, count?: number) {
  const qs = count ? `?count=${encodeURIComponent(String(count))}` : ''
  return await requestWithTimeout<any>(`${baseUrl}/users/${encodeURIComponent(userId)}/riot/matches${qs}`)
}

export async function postSync(userId: string) {
  return await requestWithTimeout<any>(`${baseUrl}/users/${encodeURIComponent(userId)}/riot/sync`, { method: 'POST' })
}

export async function postSyncRanked(userId: string) {
  return await requestWithTimeout<any>(`${baseUrl}/users/${encodeURIComponent(userId)}/riot/sync-ranked`, { method: 'POST' })
}

export async function postSyncMastery(userId: string) {
  return await requestWithTimeout<any>(`${baseUrl}/users/${encodeURIComponent(userId)}/riot/sync-mastery`, { method: 'POST' })
}

export async function postSyncMatches(userId: string) {
  return await requestWithTimeout<any>(`${baseUrl}/users/${encodeURIComponent(userId)}/riot/sync-matches`, { method: 'POST' })
}

export default {
  getProfileFull,
  getUser,
  getRiotProfile,
  getRanked,
  getMastery,
  getMatches,
  postSync,
  postSyncRanked,
  postSyncMastery,
  postSyncMatches,
}

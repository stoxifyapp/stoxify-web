const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

export async function apiFetch<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(BASE + path, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...opts?.headers,
    },
    credentials: 'include',
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err?.error?.message || 'API error')
  }

  return res.json()
}
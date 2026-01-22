export type BidRequest = { teamIndex: number; role: string; amount: number };

export type UserQuery = {
  userId: string;
  displayName: string;
  avatarUrl?: string | null;
};

const DEFAULT_BASE = '';

const baseUrl = import.meta.env.DEV
  ? '/api/$default'
  : (import.meta.env.VITE_API_BASE_URL as string) || DEFAULT_BASE;

function withUserQuery(url: string, user: UserQuery) {
  const u = new URL(url, typeof location !== 'undefined' ? location.origin : 'http://localhost');
  u.searchParams.set('userId', user.userId);
  u.searchParams.set('displayName', user.displayName);
  if (user.avatarUrl) u.searchParams.set('avatarUrl', user.avatarUrl);
  return u.toString();
}

export async function getLobby(lobbyId: string, user: UserQuery) {
  try {
    const url = withUserQuery(`${baseUrl}/lobbies/${encodeURIComponent(lobbyId)}`, user);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`GET lobby failed: ${res.status}`);
    return res.json();
  } catch (e) {
    console.error('Error fetching lobby:', e);
  }
}

export async function placeBid(lobbyId: string, bid: BidRequest, user: UserQuery) {
  const url = withUserQuery(`${baseUrl}/lobbies/${encodeURIComponent(lobbyId)}/bids`, user);
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(bid),
  });
  if (!res.ok) throw new Error(`POST bid failed: ${res.status}`);
  return res.json();
}

import {NextRequest, NextResponse} from 'next/server';

export const dynamic = 'force-dynamic';

interface IpIntel {
  ip: string;
  isp: string | null;
  org: string | null;
  asn: string | null;
  city: string | null;
  region: string | null;
  country: string | null;
  countryCode: string | null;
}

interface CacheEntry {
  data: IpIntel;
  expiresAt: number;
}

const CACHE_TTL_MS = 10 * 60 * 1000;
const intelCache = new Map<string, CacheEntry>();

function normalizeIp(raw: string | null): string {
  if (!raw) return '127.0.0.1';
  let ip = raw.trim();
  if (ip.startsWith('::ffff:')) {
    ip = ip.slice(7);
  }
  if (ip === '::1') return '127.0.0.1';
  return ip;
}

function isPrivateOrLoopback(ip: string): boolean {
  if (
    ip === '127.0.0.1' ||
    ip === 'localhost' ||
    ip === '0.0.0.0' ||
    ip === '::1' ||
    ip.startsWith('10.') ||
    ip.startsWith('192.168.') ||
    ip.startsWith('fc') ||
    ip.startsWith('fd') ||
    ip.startsWith('fe80')
  ) {
    return true;
  }
  if (ip.startsWith('172.')) {
    const second = Number.parseInt(ip.split('.')[1] ?? '', 10);
    if (second >= 16 && second <= 31) return true;
  }
  return false;
}

function extractClientIp(req: NextRequest): string {
  const candidates = [
    req.headers.get('cf-connecting-ip'),
    req.headers.get('true-client-ip'),
    req.headers.get('x-appengine-user-ip'),
    req.headers.get('x-forwarded-for')?.split(',')[0],
    req.headers.get('x-real-ip'),
  ];
  for (const candidate of candidates) {
    if (candidate) {
      const normalized = normalizeIp(candidate);
      if (normalized) return normalized;
    }
  }
  return '127.0.0.1';
}

async function fetchIpIntel(targetIp: string | null): Promise<IpIntel | null> {
  const cacheKey = targetIp ?? '__self__';
  const cached = intelCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  const endpoint = targetIp
    ? `https://ipwho.is/${encodeURIComponent(targetIp)}`
    : 'https://ipwho.is/';

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 1600);
    const res = await fetch(endpoint, {
      cache: 'no-store',
      signal: controller.signal,
      headers: {Accept: 'application/json'},
    });
    clearTimeout(timer);

    if (res.ok) {
      const json = (await res.json()) as {
        success?: boolean;
        ip?: string;
        city?: string;
        region?: string;
        country?: string;
        country_code?: string;
        connection?: {
          asn?: number;
          org?: string;
          isp?: string;
        };
      };
      if (json.success !== false && json.ip) {
        const intel: IpIntel = {
          ip: json.ip,
          isp: json.connection?.isp?.trim() || json.connection?.org?.trim() || null,
          org: json.connection?.org?.trim() || null,
          asn: json.connection?.asn ? `AS${json.connection.asn}` : null,
          city: json.city?.trim() || null,
          region: json.region?.trim() || null,
          country: json.country?.trim() || null,
          countryCode: json.country_code?.trim() || null,
        };
        intelCache.set(cacheKey, {data: intel, expiresAt: Date.now() + CACHE_TTL_MS});
        return intel;
      }
    }
  } catch {
    // Network restricted or timed out; fall back cleanly below
  }

  return null;
}

export async function GET(req: NextRequest) {
  const detectedIp = extractClientIp(req);
  const loopback = isPrivateOrLoopback(detectedIp);

  // Look up real ISP/ASN/Geo for public client IPs (e.g. Cloud Run x-forwarded-for),
  // or resolve egress public IP when running locally on loopback.
  const intel = await fetchIpIntel(loopback ? null : detectedIp);

  const headerCity =
    req.headers.get('x-appengine-city') ||
    req.headers.get('x-vercel-ip-city') ||
    null;
  const headerCountry =
    req.headers.get('x-appengine-country') ||
    req.headers.get('cf-ipcountry') ||
    req.headers.get('x-vercel-ip-country') ||
    null;

  const clientIp = loopback && intel?.ip ? intel.ip : detectedIp;
  const city = intel?.city || headerCity;
  const country = intel?.countryCode || intel?.country || headerCountry;

  const locationParts = [city, country].filter(
    (part): part is string => Boolean(part && part !== 'ZZ')
  );
  const clientLocation =
    locationParts.length > 0
      ? locationParts.join(', ')
      : loopback
        ? 'Local Loopback'
        : 'Direct Connection';

  const isp =
    intel?.isp ||
    intel?.org ||
    (loopback ? 'Local Network' : 'Public Internet');

  const hostHeader = req.headers.get('host') || 'localhost:3000';
  const regionHint =
    req.headers.get('x-cloud-trace-context') && !hostHeader.includes('localhost')
      ? `Cloud Edge (${hostHeader})`
      : hostHeader.includes('localhost') || hostHeader.includes('127.0.0.1')
        ? `Local Server (${hostHeader})`
        : `Edge Node (${hostHeader})`;

  return NextResponse.json(
    {
      clientIp,
      clientLocation,
      isp,
      org: intel?.org ?? null,
      asn: intel?.asn ?? null,
      isLoopback: loopback,
      servers: [regionHint],
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-store',
      },
    }
  );
}

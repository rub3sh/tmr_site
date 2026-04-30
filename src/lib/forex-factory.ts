type ForexImpact = 'HIGH' | 'MEDIUM' | 'LOW' | null;

export interface ForexCalendarEvent {
  id: string;
  title: string;
  description: string;
  eventType: 'ECONOMIC_NEWS';
  startTime: Date;
  endTime: null;
  source: 'FOREX_FACTORY';
  impactLevel: ForexImpact;
  country: string;
  url: string;
}

interface CacheState {
  data: ForexCalendarEvent[];
  expiresAt: number;
}

const FEED_URLS = [
  'https://nfs.faireconomy.media/ff_calendar_thisweek.xml',
  'https://nfs.faireconomy.media/ff_calendar_nextweek.xml',
];
const CACHE_TTL_MS = 5 * 60 * 1000;
const DEFAULT_FEED_TIMEZONE = process.env.FOREX_FACTORY_TIMEZONE || 'America/New_York';

let cache: CacheState | null = null;

async function fetchFeed(url: string): Promise<ForexCalendarEvent[]> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/xml,text/xml;q=0.9,*/*;q=0.8' },
      cache: 'no-store',
    });
    if (!response.ok) return [];
    const xmlBuffer = await response.arrayBuffer();
    return parseForexFactoryXml(decodeForexFeed(xmlBuffer));
  } catch {
    return [];
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function getForexFactoryEvents(): Promise<ForexCalendarEvent[]> {
  const now = Date.now();
  if (cache && cache.expiresAt > now) {
    return cache.data;
  }

  try {
    const results = await Promise.all(FEED_URLS.map(fetchFeed));
    const seen = new Set<string>();
    const merged: ForexCalendarEvent[] = [];
    for (const events of results) {
      for (const event of events) {
        if (!seen.has(event.id)) {
          seen.add(event.id);
          merged.push(event);
        }
      }
    }
    merged.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

    cache = { data: merged, expiresAt: now + CACHE_TTL_MS };
    return merged;
  } catch {
    return cache?.data ?? [];
  }
}

function decodeForexFeed(buffer: ArrayBuffer): string {
  try {
    return new TextDecoder('windows-1252').decode(buffer);
  } catch {
    return new TextDecoder().decode(buffer);
  }
}

function parseForexFactoryXml(xml: string): ForexCalendarEvent[] {
  const eventBlocks = [...xml.matchAll(/<event>([\s\S]*?)<\/event>/g)];

  return eventBlocks
    .map((match) => buildEvent(match[1]))
    .filter((event): event is ForexCalendarEvent => event !== null);
}

function buildEvent(block: string): ForexCalendarEvent | null {
  const title = getTagValue(block, 'title');
  const country = getTagValue(block, 'country');
  const date = getTagValue(block, 'date');
  const time = getTagValue(block, 'time');
  const impact = getTagValue(block, 'impact');
  const forecast = getTagValue(block, 'forecast');
  const previous = getTagValue(block, 'previous');
  const url = getTagValue(block, 'url');

  if (!title || !date || !time) {
    return null;
  }

  const startTime = parseFeedDateTime(date, time, DEFAULT_FEED_TIMEZONE);
  if (!startTime) {
    return null;
  }

  const details = [
    country ? `Country: ${country}` : null,
    forecast ? `Forecast: ${forecast}` : null,
    previous ? `Previous: ${previous}` : null,
  ].filter((part): part is string => Boolean(part));

  return {
    id: `ff-${startTime.toISOString()}-${slugify(title)}-${country || 'na'}`,
    title: country ? `${country} - ${title}` : title,
    description: details.join(' | '),
    eventType: 'ECONOMIC_NEWS',
    startTime,
    endTime: null,
    source: 'FOREX_FACTORY',
    impactLevel: mapImpactLevel(impact),
    country,
    url,
  };
}

function getTagValue(block: string, tagName: string): string {
  const match = block.match(new RegExp(`<${tagName}>([\\s\\S]*?)<\\/${tagName}>`, 'i'));
  if (!match) {
    return '';
  }

  return normalizeXmlText(match[1]);
}

function normalizeXmlText(raw: string): string {
  return raw
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseFeedDateTime(dateText: string, timeText: string, timeZone: string): Date | null {
  const dateMatch = dateText.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (!dateMatch) {
    return null;
  }

  const timeMatch = timeText.toLowerCase().match(/^(\d{1,2}):(\d{2})(am|pm)$/);
  if (!timeMatch) {
    return null;
  }

  const month = Number(dateMatch[1]);
  const day = Number(dateMatch[2]);
  const year = Number(dateMatch[3]);

  let hour = Number(timeMatch[1]);
  const minute = Number(timeMatch[2]);
  const period = timeMatch[3];

  if (hour === 12) {
    hour = 0;
  }
  if (period === 'pm') {
    hour += 12;
  }

  const zonedDate = zonedDateTimeToUtc(year, month, day, hour, minute, timeZone);
  return Number.isNaN(zonedDate.getTime()) ? null : zonedDate;
}

function zonedDateTimeToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  timeZone: string
): Date {
  const utcGuess = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));

  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });

    const parts = formatter.formatToParts(utcGuess);
    const lookup = (type: string) => parts.find((part) => part.type === type)?.value || '00';

    const zoneYear = Number(lookup('year'));
    const zoneMonth = Number(lookup('month'));
    const zoneDay = Number(lookup('day'));
    const zoneHour = Number(lookup('hour'));
    const zoneMinute = Number(lookup('minute'));
    const zoneSecond = Number(lookup('second'));

    const asIfUtc = Date.UTC(zoneYear, zoneMonth - 1, zoneDay, zoneHour, zoneMinute, zoneSecond);
    const desiredWallClock = Date.UTC(year, month - 1, day, hour, minute, 0);
    const offset = asIfUtc - desiredWallClock;

    return new Date(utcGuess.getTime() - offset);
  } catch {
    return utcGuess;
  }
}

function mapImpactLevel(impact: string): ForexImpact {
  const normalized = impact.toUpperCase();
  if (normalized === 'HIGH') {
    return 'HIGH';
  }
  if (normalized === 'MEDIUM') {
    return 'MEDIUM';
  }
  if (normalized === 'LOW') {
    return 'LOW';
  }
  return null;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

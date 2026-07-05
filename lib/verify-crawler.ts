import { reverse, resolve4 } from 'node:dns/promises';

export type CrawlerType = 'common' | 'special' | 'user-triggered' | null;

export interface CrawlerVerification {
  verified: boolean;
  hostname: string | null;
  type: CrawlerType;
}

const GOOGLEBOT_DOMAIN = 'googlebot.com';
const GOOGLE_DOMAIN = 'google.com';
const GOOGLE_USER_CONTENT = 'googleusercontent.com';

/**
 * Verify that an IP address belongs to a Google crawler using Google's
 * published DNS verification method.
 *
 * 1. Reverse DNS on the IP → get hostname
 * 2. Check hostname domain suffix
 * 3. Forward DNS on the hostname → get IPs
 * 4. Verify the original IP is in the forward DNS result
 *
 * https://developers.google.com/search/docs/crawling-news/verifying-googlebot
 */
export async function verifyGoogleCrawler(ip: string): Promise<CrawlerVerification> {
  try {
    const hostnames = await reverse(ip);

    if (hostnames.length === 0) {
      return { verified: false, hostname: null, type: null };
    }

    const hostname = hostnames[0];

    let type: CrawlerType = null;
    if (hostname.endsWith(`.${GOOGLEBOT_DOMAIN}`)) {
      type = 'common';
    } else if (hostname.endsWith(`.${GOOGLE_DOMAIN}`)) {
      type = 'special';
    } else if (hostname.endsWith(`.${GOOGLE_USER_CONTENT}`)) {
      type = 'user-triggered';
    } else {
      return { verified: false, hostname, type: null };
    }

    const ips = await resolve4(hostname);
    const verified = ips.includes(ip);

    return { verified, hostname, type };
  } catch {
    return { verified: false, hostname: null, type: null };
  }
}

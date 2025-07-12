import { CrawlStatus, URLStatus } from '@/shared/types/api';

/**
 * Helper to map live crawl status to UI-safe URLStatus
 * @param status - The crawl status to map to URL status
 * @returns  The corresponding URL status based on the crawl status
 */
export function mapCrawlToURLStatus(status: CrawlStatus): URLStatus {
  switch (status) {
    case CrawlStatus.COMPLETED:
      return URLStatus.COMPLETED;
    case CrawlStatus.FAILED:
      return URLStatus.ERROR;
    case CrawlStatus.STARTED:
    case CrawlStatus.FETCHING:
    case CrawlStatus.PARSING:
    case CrawlStatus.ANALYZING:
    case CrawlStatus.CHECKING_LINKS:
      return URLStatus.RUNNING;
    default:
      return URLStatus.QUEUED;
  }
}

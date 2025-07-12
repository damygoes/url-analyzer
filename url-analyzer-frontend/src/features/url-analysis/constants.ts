import { CrawlStatus } from '@/shared/types/api';

export const activeCrawlStatuses = new Set<CrawlStatus>([
  CrawlStatus.STARTED,
  CrawlStatus.FETCHING,
  CrawlStatus.PARSING,
  CrawlStatus.ANALYZING,
  CrawlStatus.CHECKING_LINKS,
]);

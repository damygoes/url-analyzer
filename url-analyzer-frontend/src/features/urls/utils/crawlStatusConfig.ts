import type { CrawlStatusConfigEntry } from '@/features/urls/types';
import { CrawlStatus } from '@/shared/types/api';

export const crawlStatusConfig: Record<CrawlStatus, CrawlStatusConfigEntry> = {
  [CrawlStatus.STARTED]: {
    label: 'Starting crawl...',
    icon: 'loading',
    color: 'text-blue-600',
  },
  [CrawlStatus.FETCHING]: {
    label: 'Fetching page content...',
    icon: 'globe',
    color: 'text-blue-600',
  },
  [CrawlStatus.PARSING]: {
    label: 'Parsing HTML...',
    icon: 'file-search',
    color: 'text-blue-600',
  },
  [CrawlStatus.ANALYZING]: {
    label: 'Analyzing page structure...',
    icon: 'bar-chart',
    color: 'text-blue-600',
  },
  [CrawlStatus.CHECKING_LINKS]: {
    label: 'Checking links...',
    icon: 'link',
    color: 'text-blue-600',
  },
  [CrawlStatus.COMPLETED]: {
    label: 'Crawl completed',
    icon: 'completed',
    color: 'text-green-600',
  },
  [CrawlStatus.FAILED]: {
    label: 'Crawl failed',
    icon: 'error',
    color: 'text-destructive',
  },
};

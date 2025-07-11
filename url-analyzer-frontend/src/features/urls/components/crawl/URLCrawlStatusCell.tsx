import { urlKeys, useCrawlStatus } from '@/features/urls/hooks/useURLs';
import { CrawlStatus, URLStatus, type URLWithResult } from '@/shared/types/api';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { URLStatusBadge } from '../url-badge/URLStatusBadge';
import { CrawlProgress } from './CrawlProgress';

interface URLCrawlStatusCellProps {
  url: URLWithResult;
}


export function URLCrawlStatusCell({ url }: URLCrawlStatusCellProps) {
  const queryClient = useQueryClient();

  const isRunning = url.status === URLStatus.RUNNING;
  const { data: crawlStatus, isLoading } = useCrawlStatus(url.id, isRunning);

  const runningCrawlStatuses = new Set([
    CrawlStatus.STARTED,
    CrawlStatus.FETCHING,
    CrawlStatus.PARSING,
    CrawlStatus.ANALYZING,
    CrawlStatus.CHECKING_LINKS,
  ]);

  // Invalidate URL list/detail when crawl finishes to update url.status
  useEffect(() => {
    if (
      crawlStatus &&
      (crawlStatus.status === CrawlStatus.COMPLETED ||
        crawlStatus.status === CrawlStatus.FAILED)
    ) {
      queryClient.invalidateQueries({ queryKey: urlKeys.detail(url.id) });
      queryClient.invalidateQueries({ queryKey: urlKeys.lists() });
    }
  }, [crawlStatus, queryClient, url.id]);

  if (!crawlStatus || isLoading || !runningCrawlStatuses.has(crawlStatus.status)) {
    return <URLStatusBadge status={url.status} />;
  }

  return <CrawlProgress status={crawlStatus} />;
}


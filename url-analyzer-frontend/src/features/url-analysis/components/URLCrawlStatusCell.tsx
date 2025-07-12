import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { urlKeys, useCrawlStatus } from '@/features/urls/hooks/useURLs';
import { URLStatusBadge } from '../../urls/components/url-badge/URLStatusBadge';
import { useURLAnalysisStore } from '../store/urlAnalysisStore';
import { CrawlProgress } from './CrawlProgress';

import { CrawlStatus, URLStatus, type URLWithResult } from '@/shared/types/api';
import { mapCrawlToURLStatus } from '../utils/mapCrawlToURLStatus';

interface URLCrawlStatusCellProps {
  url: URLWithResult;
}

export function URLCrawlStatusCell({ url }: URLCrawlStatusCellProps) {
  const queryClient = useQueryClient();
  const { analyzingIDs, setAnalyzingIDs } = useURLAnalysisStore();

  const isRunning = url.status === URLStatus.RUNNING;
  const { data: crawlStatus, isLoading } = useCrawlStatus(url.id, isRunning);

  const runningCrawlStatuses = new Set<CrawlStatus>([
    CrawlStatus.STARTED,
    CrawlStatus.FETCHING,
    CrawlStatus.PARSING,
    CrawlStatus.ANALYZING,
    CrawlStatus.CHECKING_LINKS,
  ]);

  const isFinished =
    crawlStatus &&
    (crawlStatus.status === CrawlStatus.COMPLETED ||
      crawlStatus.status === CrawlStatus.FAILED);

  // Update query cache when crawl finishes
  useEffect(() => {
    if (isFinished && crawlStatus) {
      // Optimistically update list data
      queryClient.setQueryData(urlKeys.lists(), (old: unknown) => {
        if (!old || typeof old !== 'object' || !('items' in old)) return old;
        const list = old as {
          items: URLWithResult[];
          [key: string]: unknown;
        };

        return {
          ...list,
          items: list.items.map((item) =>
            item.id === url.id
              ? { ...item, status: mapCrawlToURLStatus(crawlStatus.status) }
              : item
          ),
        };
      });

      // Invalidate to re-fetch fresh data
      queryClient.invalidateQueries({ queryKey: urlKeys.detail(url.id) });
      queryClient.invalidateQueries({ queryKey: urlKeys.lists() });

      // Remove from local analyzing state
      if (analyzingIDs.includes(url.id)) {
        setAnalyzingIDs(analyzingIDs.filter((id) => id !== url.id));
      }
    }
  }, [
    crawlStatus,
    queryClient,
    url.id,
    analyzingIDs,
    setAnalyzingIDs,
    isFinished,
  ]);

  // Safely determine UI status
  const derivedStatus: URLStatus =
    crawlStatus && !isLoading
      ? mapCrawlToURLStatus(crawlStatus.status)
      : url.status;

  if (crawlStatus && runningCrawlStatuses.has(crawlStatus.status)) {
    return <CrawlProgress status={crawlStatus} />;
  }

  return <URLStatusBadge status={derivedStatus} />;
}

import { isCrawlResultEmpty } from '@/features/url-analysis/utils/isCrawlResultEmpty';
import type { CrawlResult } from '@/shared/types/api';
import { HeadingDistributionChart } from '../components/charts/HeadingDistributionChart';
import { LinkDistributionChart } from '../components/charts/LinkDistributionChart';
import { EmptyChartsSection } from '../components/EmptyChartsSection';

interface ChartsSectionProps {
  crawlResult: CrawlResult;
}

export function ChartsSection({ crawlResult }: ChartsSectionProps) {
  const empty = isCrawlResultEmpty(crawlResult);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {empty ? (
        <EmptyChartsSection />
      ) : (
        <>
          <LinkDistributionChart crawlResult={crawlResult} />
          <HeadingDistributionChart crawlResult={crawlResult} />
        </>
      )}
    </div>
  );
}

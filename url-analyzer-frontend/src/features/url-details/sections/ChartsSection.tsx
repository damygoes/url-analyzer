import type { CrawlResult } from '@/shared/types/api';
import { HeadingDistributionChart } from '../components/charts/HeadingDistributionChart';
import { LinkDistributionChart } from '../components/charts/LinkDistributionChart';

interface ChartsSectionProps {
  crawlResult: CrawlResult;
}

export function ChartsSection({crawlResult}: ChartsSectionProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <LinkDistributionChart crawlResult={crawlResult} />
      <HeadingDistributionChart crawlResult={crawlResult} />
    </div>
  );
}

import type { CrawlResult } from '@/shared/types/api';
import { LinkDistributionChart } from '../components/charts/LinkDistributionChart';

interface ChartsSectionProps {
  crawlResult: CrawlResult;
}

export function ChartsSection({crawlResult}: ChartsSectionProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <LinkDistributionChart crawlResult={crawlResult} />
      <div>Heading Chart</div>
    </div>
  );
}

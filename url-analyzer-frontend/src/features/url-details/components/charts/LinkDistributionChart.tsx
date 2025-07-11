import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import type { CrawlResult } from '@/shared/types/api';
import { Pie, PieChart, Sector } from 'recharts';
import type { PieSectorDataItem } from 'recharts/types/polar/Pie';

interface LinkDistributionChartProps {
  crawlResult: CrawlResult;
}

const getChartData = (result: CrawlResult) => [
  { name: 'internal', value: result.internal_links, fill: 'var(--chart-3)' },
  { name: 'external', value: result.external_links, fill: 'var(--chart-2)' },
];

const chartConfig = {
  internal: {
    label: 'Internal Links',
    color: 'var(--chart-3)',
  },
  external: {
    label: 'External Links',
    color: 'var(--chart-2)',
  },
} satisfies ChartConfig;

export function LinkDistributionChart({
  crawlResult,
}: LinkDistributionChartProps) {
  const chartData = getChartData(crawlResult);
  const totalLinks = crawlResult.internal_links + crawlResult.external_links;

  if (totalLinks === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Link Distribution</CardTitle>
          <CardDescription>Internal vs External links</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            No links found on this page
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Link Distribution</CardTitle>
        <CardDescription>
          Total: {totalLinks} links ({crawlResult.broken_links_count} broken)
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[300px]"
        >
          <PieChart>
            <ChartTooltip
              content={<ChartTooltipContent hideLabel />}
              cursor={false}
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              strokeWidth={5}
              activeIndex={0}
              activeShape={({
                outerRadius = 0,
                ...props
              }: PieSectorDataItem) => (
                <Sector {...props} outerRadius={outerRadius + 8} />
              )}
            />
            <ChartLegend
              content={<ChartLegendContent nameKey="name" />}
              className="-translate-y-2 flex-wrap gap-2 *:basis-1/2 *:justify-center"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-1 text-sm">
        <div className="text-muted-foreground">
          Showing link distribution for the latest crawl
        </div>
      </CardFooter>
    </Card>
  );
}

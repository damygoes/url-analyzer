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
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import type { CrawlResult } from '@/shared/types/api';
import { Bar, BarChart, XAxis, YAxis } from 'recharts';

interface HeadingDistributionChartProps {
  crawlResult: CrawlResult;
}

const getChartData = (result: CrawlResult) => [
  { level: 'H1', count: result.h1_count },
  { level: 'H2', count: result.h2_count },
  { level: 'H3', count: result.h3_count },
  { level: 'H4', count: result.h4_count },
  { level: 'H5', count: result.h5_count },
  { level: 'H6', count: result.h6_count },
];

const chartConfig = {
  count: {
    label: 'Heading Count',
    color: 'var(--chart-3)',
  },
} satisfies ChartConfig;

export function HeadingDistributionChart({
  crawlResult,
}: HeadingDistributionChartProps) {
  const chartData = getChartData(crawlResult);
  const totalHeadings = chartData.reduce((sum, item) => sum + item.count, 0);

  if (totalHeadings === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Heading Distribution</CardTitle>
          <CardDescription>Count of heading tags by level</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            No heading tags found on this page
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Heading Distribution</CardTitle>
        <CardDescription>Total: {totalHeadings} heading tags</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="max-h-[300px]">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ left: 0 }}
            barCategoryGap={12}
          >
            <XAxis type="number" hide />
            <YAxis
              dataKey="level"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <ChartTooltip
              content={<ChartTooltipContent hideLabel />}
              cursor={false}
            />
            <Bar dataKey="count" fill="var(--color-count)" radius={5} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-1 text-sm">
        <div className="text-muted-foreground">
          Showing heading levels found in latest crawl
        </div>
      </CardFooter>
    </Card>
  );
}

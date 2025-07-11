import { Card, CardContent } from '@/components/ui/card';

export function EmptyChartsSection() {
  return (
    <Card className="lg:col-span-2">
      <CardContent className="h-[300px] flex items-center justify-center text-muted-foreground">
        No crawl data available to display charts.
      </CardContent>
    </Card>
  );
}

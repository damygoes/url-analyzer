import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { BrokenLink } from '@/shared/types/api';
import { BrokenLinksTable } from '../components/broken-links/BrokenLinksTable';

interface BrokenLinksSectionProps {
  brokenLinks: BrokenLink[] | null;
}

export function BrokenLinksSection({ brokenLinks }: BrokenLinksSectionProps) {

  const brokenLinksCount = brokenLinks ? brokenLinks.length : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Broken Links: {`${brokenLinksCount}`}</CardTitle>
        <CardDescription>
          Links that returned error status codes
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!brokenLinks ? <p> No broken links  found </p> : <BrokenLinksTable links={brokenLinks} />}
      </CardContent>
    </Card>
  );
}

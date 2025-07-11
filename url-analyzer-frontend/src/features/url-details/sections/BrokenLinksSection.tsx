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
  brokenLinks: BrokenLink[];
}

export function BrokenLinksSection({ brokenLinks }: BrokenLinksSectionProps) {
  if (brokenLinks.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Broken Links</CardTitle>
        <CardDescription>
          Links that returned error status codes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <BrokenLinksTable links={brokenLinks} />
      </CardContent>
    </Card>
  );
}

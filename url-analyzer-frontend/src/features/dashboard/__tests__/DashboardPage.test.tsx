import { URLStatus } from '@/shared/types/api';
import { render, screen, within } from '@/test/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { DashboardPage } from '../pages/DashboardPage';

const mockUrls = [
  {
    id: 1,
    url: 'https://example.com',
    crawl_result: {
      title: 'Example Title',
      html_version: '10',
      internal_links: 5,
      external_links: 2,
      broken_links_count: 0,
    },
    status: URLStatus.COMPLETED,
  },
];

vi.mock('@/features/urls/hooks/useURLs', () => ({
  useURLs: () => ({
    data: {
      items: mockUrls,
      page: 1,
      pageSize: 10,
      total: 1,
      totalPages: 1,
    },
    isLoading: false,
    isError: false,
  }),
  useDeleteURLs: () => ({ mutate: vi.fn(), isLoading: false }),
  useCreateURL: () => ({ mutate: vi.fn(), isLoading: false }),
  useCrawlStatus: () => ({ data: null, isLoading: false }),
  useStartCrawlingURLs: () => ({ mutate: vi.fn(), isLoading: false }),
  useRestartCrawlingURLs: () => ({ mutate: vi.fn(), isLoading: false }),
  useStopCrawlingURLs: () => ({ mutate: vi.fn(), isLoading: false }),
}));

describe('<DashboardPage />', () => {
  it('renders URL table with fetched data', () => {
    render(<DashboardPage />);

    const row = screen.getByText('https://example.com').closest('tr');
    expect(row).toBeInTheDocument();

    const utils = within(row!);

    expect(utils.getByText('Example Title')).toBeInTheDocument();
    expect(utils.getByText('10')).toBeInTheDocument();
    expect(utils.getByText('5')).toBeInTheDocument();

    expect(utils.getByText('2')).toBeInTheDocument();

    expect(utils.getByText('0')).toBeInTheDocument();
  });
});

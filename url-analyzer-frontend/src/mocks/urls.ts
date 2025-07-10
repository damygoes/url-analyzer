import { URLStatus, type URLWithResult } from '@/shared/types/api';

export const mockURLs: URLWithResult[] = Array.from({ length: 25 }, (_, i) => {
  const id = i + 1;
  const statusOptions = [
    URLStatus.QUEUED,
    URLStatus.RUNNING,
    URLStatus.COMPLETED,
    URLStatus.ERROR,
  ];
  const status = statusOptions[i % statusOptions.length];

  return {
    id,
    url: `https://example-${id}.com`,
    status,
    error_message: status === URLStatus.ERROR ? 'Timeout occurred' : undefined,
    created_at: new Date(Date.now() - i * 1000 * 60 * 60).toISOString(),
    updated_at: new Date(Date.now() - i * 1000 * 60).toISOString(),
    crawl_result:
      status === URLStatus.COMPLETED
        ? {
            id,
            url_id: id,
            title: `Example Page ${id}`,
            html_version: 'HTML5',
            h1_count: 1,
            h2_count: 2,
            h3_count: 3,
            h4_count: 0,
            h5_count: 0,
            h6_count: 0,
            internal_links: 12 + (id % 5),
            external_links: 8 + (id % 3),
            broken_links_count: id % 3 === 0 ? 2 : 0,
            has_login_form: id % 4 === 0,
            crawled_at: new Date().toISOString(),
          }
        : undefined,
  };
});

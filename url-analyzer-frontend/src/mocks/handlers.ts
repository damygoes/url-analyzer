import { URLStatus } from '@/shared/types/api';
import { http, HttpResponse } from 'msw';
import { z } from 'zod';

const createUrlSchema = z.object({
  url: z.url(),
});

export const handlers = [
  // Health check
  http.get('/api/health', () => {
    return HttpResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: '1h30m',
      version: '1.0.0',
      database: 'connected',
      memory_mb: 256,
      goroutines: 10,
    });
  }),

  // Auth verification
  http.get('/auth/verify', ({ request }) => {
    const authHeader = request.headers.get('Authorization');

    if (authHeader === 'test-api-key-12345') {
      return HttpResponse.json({ success: true });
    }

    return new HttpResponse('Unauthorized', { status: 401 });
  }),

  // Get URLs
  http.get('/api/urls', () => {
    return HttpResponse.json({
      data: {
        data: [
          {
            id: 1,
            url: 'https://example.com',
            status: URLStatus.COMPLETED,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            crawl_result: {
              id: 1,
              url_id: 1,
              title: 'Example Domain',
              html_version: 'HTML5',
              h1_count: 1,
              h2_count: 0,
              h3_count: 0,
              h4_count: 0,
              h5_count: 0,
              h6_count: 0,
              internal_links: 5,
              external_links: 3,
              broken_links_count: 0,
              has_login_form: false,
              crawled_at: '2024-01-01T00:00:00Z',
            },
          },
        ],
        page: 1,
        page_size: 10,
        total: 1,
        total_pages: 1,
      },
    });
  }),

  // Create URL
  http.post('/api/urls', async ({ request }) => {
    const body = createUrlSchema.parse(await request.json());

    return HttpResponse.json(
      {
        data: {
          message: 'URL added successfully',
          url: {
            id: 2,
            url: body.url,
            status: URLStatus.QUEUED,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        },
      },
      { status: 201 }
    );
  }),

  // Get URL details
  http.get('/api/urls/:id', ({ params }) => {
    const { id } = params;

    return HttpResponse.json({
      data: {
        url: {
          id: Number(id),
          url: 'https://example.com',
          status: URLStatus.COMPLETED,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
        crawl_result: {
          id: 1,
          url_id: Number(id),
          title: 'Example Domain',
          html_version: 'HTML5',
          h1_count: 1,
          h2_count: 2,
          h3_count: 3,
          h4_count: 0,
          h5_count: 0,
          h6_count: 0,
          internal_links: 5,
          external_links: 3,
          broken_links_count: 1,
          has_login_form: false,
          crawled_at: '2024-01-01T00:00:00Z',
        },
        broken_links: [
          {
            id: 1,
            crawl_result_id: 1,
            url: 'https://example.com/broken',
            status_code: 404,
            error_message: 'Not Found',
            link_text: 'Broken Link',
            is_internal: true,
          },
        ],
      },
    });
  }),
];

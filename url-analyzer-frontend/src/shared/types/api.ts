export enum URLStatus {
  QUEUED = 'queued',
  RUNNING = 'running',
  COMPLETED = 'completed',
  ERROR = 'error',
}

export enum CrawlStatus {
  STARTED = 'started',
  FETCHING = 'fetching',
  PARSING = 'parsing',
  ANALYZING = 'analyzing',
  CHECKING_LINKS = 'checking_links',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export enum URLSortField {
  URL = 'url',
  STATUS = 'status',
  CREATED_AT = 'created_at',
  UPDATED_AT = 'updated_at',
  TITLE = 'title',
  INTERNAL_LINKS = 'internal_links',
  EXTERNAL_LINKS = 'external_links',
  BROKEN_LINKS_COUNT = 'broken_links_count',
}

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
  details?: string;
}

// For responses that only have message (like success responses)
export interface MessageResponse {
  message: string;
}

// For error responses
export interface ErrorResponse {
  error: string;
  details?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

export interface URL {
  id: number;
  url: string;
  status: URLStatus;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface CrawlResult {
  id: number;
  url_id: number;
  title?: string;
  html_version?: string;
  h1_count: number;
  h2_count: number;
  h3_count: number;
  h4_count: number;
  h5_count: number;
  h6_count: number;
  internal_links: number;
  external_links: number;
  broken_links_count: number;
  has_login_form: boolean;
  crawled_at: string;
}

export interface BrokenLink {
  id: number;
  crawl_result_id: number;
  url: string;
  status_code: number;
  error_message: string;
  link_text?: string;
  is_internal: boolean;
}

export interface URLWithResult extends URL {
  crawl_result?: CrawlResult;
}

export interface URLDetails {
  url: URL;
  crawl_result?: CrawlResult;
  broken_links: BrokenLink[];
  job_status?: CrawlJobStatus;
}

export interface CrawlJobStatus {
  id: number;
  url: string;
  status: CrawlStatus;
  progress: number;
  message: string;
  start_time: string;
  end_time?: string;
}

export interface SystemHealth {
  status: string;
  timestamp: string;
  uptime: string;
  version: string;
  database: string;
  database_error?: string;
  memory_mb: number;
  goroutines: number;
}

export interface SystemStats {
  database: {
    queued: number;
    running: number;
    completed: number;
    error: number;
    total_crawl_results: number;
    total_broken_links: number;
  };
  crawler: {
    timeout: string;
    max_redirects: number;
    user_agent: string;
    active_jobs: number;
    check_broken_links: boolean;
    max_links_to_check: number;
    concurrent_checks: number;
  };
  active_jobs: number;
  jobs_detail: Record<string, CrawlJobStatus>;
  system: {
    uptime: string;
    goroutines: number;
  };
}

export interface CreateURLRequest {
  url: string;
}

export interface URLFilter {
  status?: URLStatus;
  search?: string;
  page?: number;
  page_size?: number;
  sort_by?: URLSortField;
  sort_order?: SortOrder;
}

export interface DeleteURLsRequest {
  ids: number[];
}

export interface CreateURLResponse {
  message: string;
  url: URL;
}

export type URLListResponse = PaginatedResponse<URLWithResult>;

export interface URLDetailsResponse {
  url: URL;
  crawl_result?: CrawlResult;
  broken_links: BrokenLink[];
  job_status?: CrawlJobStatus;
}

export interface CrawlStatusResponse {
  job_status: CrawlJobStatus;
}

export interface ActiveJobsResponse {
  active_jobs: Record<string, CrawlJobStatus>;
  count: number;
}

// Chart Data Types
export interface HeadingData {
  name: string;
  value: number;
  fill: string;
}

export interface LinkData {
  name: string;
  value: number;
  fill: string;
}

// Utility types
export type URLStatusFilter = URLStatus | 'all';
export type CreateURLApiResponse = ApiResponse<CreateURLResponse>;
export type URLListApiResponse = ApiResponse<URLListResponse>;
export type URLDetailsApiResponse = ApiResponse<URLDetailsResponse>;
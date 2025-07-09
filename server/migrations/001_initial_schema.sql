CREATE TABLE urls (
    id INT AUTO_INCREMENT PRIMARY KEY,
    url VARCHAR(2048) NOT NULL UNIQUE,
    status ENUM('queued', 'running', 'completed', 'error') DEFAULT 'queued',
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

CREATE TABLE crawl_results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    url_id INT NOT NULL,
    title VARCHAR(1024),
    html_version VARCHAR(50),
    h1_count INT DEFAULT 0,
    h2_count INT DEFAULT 0,
    h3_count INT DEFAULT 0,
    h4_count INT DEFAULT 0,
    h5_count INT DEFAULT 0,
    h6_count INT DEFAULT 0,
    internal_links INT DEFAULT 0,
    external_links INT DEFAULT 0,
    broken_links_count INT DEFAULT 0,
    has_login_form BOOLEAN DEFAULT FALSE,
    crawled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (url_id) REFERENCES urls(id) ON DELETE CASCADE,
    INDEX idx_url_id (url_id)
);

CREATE TABLE broken_links (
    id INT AUTO_INCREMENT PRIMARY KEY,
    crawl_result_id INT NOT NULL,
    url VARCHAR(2048) NOT NULL,
    status_code INT NOT NULL,
    error_message TEXT,
    link_text VARCHAR(1024),
    is_internal BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (crawl_result_id) REFERENCES crawl_results(id) ON DELETE CASCADE,
    INDEX idx_crawl_result_id (crawl_result_id)
);

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    api_key VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_api_key (api_key)
);

-- Insert a default user for testing
INSERT INTO users (username, api_key) VALUES ('admin', 'test-api-key-12345');
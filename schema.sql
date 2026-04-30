CREATE TABLE IF NOT EXISTS contacts (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  message TEXT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_created (createdAt)
) 



-- Create admin-only users table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email)
) 



-- schema.sql
 

--hero Slides
CREATE TABLE IF NOT EXISTS slides (
  id VARCHAR(36) PRIMARY KEY,
  
  -- Image configuration (STORED AS BLOB, NOT Base64)
  use_image BOOLEAN DEFAULT TRUE,
  image_data LONGBLOB NULL COMMENT 'Raw binary image data',
  image_mime_type VARCHAR(50) NULL COMMENT 'MIME type like image/jpeg, image/png, image/webp',
  image_alt VARCHAR(255) DEFAULT 'Hero slide background',
  
  -- Content configuration
  show_heading BOOLEAN DEFAULT TRUE,
  heading VARCHAR(255) NULL,
  
  show_tag BOOLEAN DEFAULT TRUE,
  tag VARCHAR(255) NULL,
  
  -- Button configuration
  show_buttons BOOLEAN DEFAULT TRUE,
  button_count TINYINT UNSIGNED DEFAULT 2 CHECK (button_count IN (1, 2)),

  -- Button 1
  button1_text VARCHAR(100) NULL,
  button1_link VARCHAR(255) NULL,
  button1_variant ENUM('primary', 'secondary') DEFAULT 'primary',

  -- Button 2
  button2_text VARCHAR(100) NULL,
  button2_link VARCHAR(255) NULL,
  button2_variant ENUM('primary', 'secondary') DEFAULT 'secondary',
  
  -- Metadata
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Indexes for performance
  INDEX idx_active_order (is_active, sort_order),
  INDEX idx_id_active (id, is_active),
  INDEX idx_updated_at (updated_at)
  
)


 
 

 -- 1️⃣ Projects
CREATE TABLE IF NOT EXISTS projects (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  status ENUM('ongoing', 'sold', 'upcoming') DEFAULT 'ongoing',
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_slug (slug),
  INDEX idx_status (status),
  INDEX idx_published (is_published)
);

-- 2️⃣ Project Configs
CREATE TABLE IF NOT EXISTS project_configs (
  id VARCHAR(36) PRIMARY KEY,
  project_id VARCHAR(36) UNIQUE NOT NULL,
  section_hero_enabled BOOLEAN DEFAULT TRUE,
  section_info_enabled BOOLEAN DEFAULT TRUE,
  section_stats_enabled BOOLEAN DEFAULT TRUE,
  section_highlight_enabled BOOLEAN DEFAULT TRUE,
  section_media_enabled BOOLEAN DEFAULT TRUE,
  section_units_enabled BOOLEAN DEFAULT TRUE,
  section_collage_enabled BOOLEAN DEFAULT TRUE,
  section_location_enabled BOOLEAN DEFAULT TRUE,
  hero_title VARCHAR(255),
  hero_subtitle VARCHAR(255),
  info_title VARCHAR(255),
  info_firstdescription TEXT,
  info_seconddescription TEXT,
  stats_config JSON,
  highlight_title VARCHAR(255),
  highlight_paragraph TEXT,
  google_map_embed_url TEXT,
  collage_show_more_limit INT DEFAULT 6,
  collage_layout_pattern ENUM('modulo-6', 'masonry', 'grid') DEFAULT 'modulo-6',
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  INDEX idx_project (project_id)
);

-- 3️⃣ Project Files
CREATE TABLE IF NOT EXISTS project_files (
  id VARCHAR(36) PRIMARY KEY,
  project_id VARCHAR(36) NOT NULL,
  section_name ENUM('hero','info','stats','highlight','media','units','collage','location','brochure','document') NOT NULL,
  file_type ENUM('image','pdf') NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_data LONGBLOB NOT NULL,
  thumbnail_data LONGBLOB,
  alt_text VARCHAR(255),
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  INDEX idx_project_section (project_id, section_name),
  INDEX idx_sort (project_id, section_name, sort_order),
  INDEX idx_active (is_active)
);

-- 4️⃣ Project Downloads
CREATE TABLE IF NOT EXISTS project_downloads (
  id VARCHAR(36) PRIMARY KEY,
  project_id VARCHAR(36) NOT NULL,
  download_type ENUM('brochure','document') NOT NULL,
  title VARCHAR(255) NOT NULL,
  file_id VARCHAR(36) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (file_id) REFERENCES project_files(id) ON DELETE CASCADE,
  INDEX idx_project_type (project_id, download_type)
);
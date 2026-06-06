// types/news.ts

export type NewsCategory = 'press_media' | 'blog';

export interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  category: NewsCategory;
  categoryLabel?: string;
  content?: string;
  source?: string;
  published_date: string;
  is_published: boolean;
  sort_order: number;
  view_count: number;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface NewsImage {
  id: string;
  news_id: string;
  image_data: Buffer;
  mime_type: string;
  blur_data: string;
  width: number;
  height: number;
  version: number;
}

export interface NewsFormData {
  id?: string;
  title: string;
  category: NewsCategory;
  content?: string;
  imageFile?: File;
  source?: string;
  published_date: string;
  is_published: boolean;
  sort_order: number;
}

export interface NewsCategoryItem {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
  is_active: boolean;
}
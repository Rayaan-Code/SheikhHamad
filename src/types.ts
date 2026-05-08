export type ContentType = 'ARTICLE' | 'AUDIO' | 'VIDEO' | 'PDF';

export interface Speaker {
  id: string;
  name: string;
  bio?: string;
  imageUrl?: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface Content {
  id: string;
  title: string;
  slug: string;
  description?: string;
  body?: string;
  type: ContentType;
  mediaUrl?: string;
  speakerId: string;
  categoryId: string;
  courseId?: string;
  youtubeId?: string;
  isFeatured: boolean;
  createdAt: any; // Firestore Timestamp
}

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnailUrl?: string;
  isFeatured: boolean;
  createdAt: any;
}

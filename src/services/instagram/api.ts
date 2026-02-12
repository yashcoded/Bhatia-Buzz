import { instagramConfig } from '../../constants/config';
import { Post } from '../../types';

interface InstagramPost {
  id: string;
  caption?: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  media_url: string;
  permalink: string;
  timestamp: string;
  username?: string;
}

interface InstagramResponse {
  data: InstagramPost[];
  paging?: {
    cursors?: {
      before?: string;
      after?: string;
    };
    next?: string;
  };
}

// Convert Instagram post to app Post format
const convertInstagramPost = (igPost: InstagramPost, userId: string, userName: string): Post => {
  return {
    id: `ig_${igPost.id}`,
    userId,
    userName: igPost.username || userName,
    content: igPost.caption || '',
    imageUrl: igPost.media_url,
    createdAt: new Date(igPost.timestamp).toISOString(),
    likes: 0,
    comments: [],
    likedBy: [],
  };
};

// Fetch posts from Instagram Graph API
export const fetchInstagramPosts = async (
  userId: string,
  userName: string,
  limit: number = 20,
  after?: string
): Promise<{ posts: Post[]; nextCursor?: string }> => {
  try {
    if (!instagramConfig.accessToken) {
      // Industry-standard behavior: do not crash the app if IG isn't configured yet.
      // Just return an empty set so the rest of the feed can load.
      console.warn('Instagram access token not configured — skipping Instagram fetch');
      return { posts: [], nextCursor: undefined };
    }

    let url = `${instagramConfig.apiUrl}/${instagramConfig.version}/me/media?fields=id,caption,media_type,media_url,permalink,timestamp,username&limit=${limit}&access_token=${instagramConfig.accessToken}`;

    if (after) {
      url += `&after=${after}`;
    }

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Instagram API error: ${response.statusText}`);
    }

    const data: InstagramResponse = await response.json();
    
    const posts = data.data.map((igPost) => convertInstagramPost(igPost, userId, userName));
    const nextCursor = data.paging?.cursors?.after;

    return { posts, nextCursor };
  } catch (error) {
    console.error('Error fetching Instagram posts:', error);
    // Do not crash the app; return empty set and let Firestore posts still show.
    return { posts: [], nextCursor: undefined };
  }
};

// Get a specific Instagram post
export const getInstagramPost = async (
  postId: string,
  userId: string,
  userName: string
): Promise<Post | null> => {
  try {
    if (!instagramConfig.accessToken) {
      console.warn('Instagram access token not configured — skipping Instagram fetch');
      return null;
    }

    const url = `${instagramConfig.apiUrl}/${instagramConfig.version}/${postId}?fields=id,caption,media_type,media_url,permalink,timestamp,username&access_token=${instagramConfig.accessToken}`;

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Instagram API error: ${response.statusText}`);
    }

    const igPost: InstagramPost = await response.json();
    return convertInstagramPost(igPost, userId, userName);
  } catch (error) {
    console.error('Error fetching Instagram post:', error);
    return null;
  }
};

// Cache Instagram posts (simple in-memory cache)
const cache: Map<string, { posts: Post[]; timestamp: number }> = new Map();
const CACHE_DURATION = 3600000; // 1 hour

export const getCachedInstagramPosts = (key: string): Post[] | null => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.posts;
  }
  return null;
};

export const setCachedInstagramPosts = (key: string, posts: Post[]): void => {
  cache.set(key, { posts, timestamp: Date.now() });
};

export const clearInstagramCache = (): void => {
  cache.clear();
};


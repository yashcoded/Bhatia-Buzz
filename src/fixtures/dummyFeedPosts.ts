import { Post } from '../types';

/**
 * Dummy feed posts shown when there are no real posts and the Instagram API key
 * is not configured (or Firestore returns empty). Gives users something to see
 * on the home screen instead of a blank "No posts yet".
 */
export const DUMMY_FEED_POSTS: Post[] = [
  {
    id: 'dummy-feed-1',
    userId: 'demo-user-1',
    userName: 'Bhatia Community',
    content: 'Welcome to Bhatia Buzz! This is a sample post. When you add Firestore posts or configure the Instagram integration, your real feed will appear here.',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    likes: 12,
    comments: [],
    likedBy: [],
  },
  {
    id: 'dummy-feed-2',
    userId: 'demo-user-2',
    userName: 'Community Team',
    content: 'Use the Feed for updates, Panja Khada for the game, Match for matrimonial profiles, and Profile for your account and settings.',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    likes: 5,
    comments: [],
    likedBy: [],
  },
  {
    id: 'dummy-feed-3',
    userId: 'demo-user-3',
    userName: 'Bhatia Buzz',
    content: 'Pull to refresh to load new posts. If you have admin access, you can create posts from the "What\'s on your mind?" box above.',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    likes: 8,
    comments: [],
    likedBy: [],
  },
];

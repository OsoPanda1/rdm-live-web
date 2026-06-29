// Shared social domain contracts (front <-> back)

export interface SocialProfile {
  id: string;
  handle: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  location?: string;
  createdAt: string;
}

export interface SocialPost {
  id: string;
  authorId: string;
  channelId?: string;
  content: string;
  mediaUrls?: string[];
  tags?: string[];
  likes?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface SocialChannel {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  members: string[];
  createdAt: string;
}

export interface SocialFeedItem extends SocialPost {
  author: SocialProfile;
}

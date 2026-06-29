import type { AuthUser } from "../types/auth.js";

export interface UserRecord extends AuthUser {
  email: string;
  passwordHash: string;
}

export interface ProfileRecord {
  userId: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  interests: string[];
  socialLinks: string[];
  createdAt: string;
  updatedAt: string;
}

export interface BusinessRecord {
  id: string;
  ownerId: string;
  name: string;
  description?: string;
  category: string;
  latitude: number;
  longitude: number;
  address?: string;
  plan: "basic" | "plus" | "premium";
  isActive: boolean;
  createdAt: string;
}

export interface DonationRecord {
  id: string;
  amount: number;
  providerId: string;
  currency: string;
  createdAt: string;
}


export interface TwinRecord {
  id: string;
  modelId: string;
  businessId: string;
  name: string;
  tags: string[];
  state: {
    desired: Record<string, string | number | boolean>;
    reported: Record<string, string | number | boolean>;
    telemetry: Record<string, number> & { occupancy: number; avgStayMinutes: number; queueMinutes: number };
  };
  scene: {
    renderer: "webgl" | "webxr" | "webgpu";
    stylePreset: "heritage" | "festival" | "nature";
    pbr: boolean;
    hdri: string;
    postprocess: string[];
  };
  graph: {
    incoming: string[];
    outgoing: string[];
  };
  guideAvatar: {
    style: "realista" | "cinematico";
    locale: "es-MX";
    voice: string;
  };
  updatedAt: string;
}

export interface TwinEventRecord {
  id: string;
  twinId: string;
  kind: string;
  payload: Record<string, string | number | boolean>;
  createdAt: string;
}

export interface InteractionRecord {
  id: string;
  kind: string;
  context?: string;
  businessId?: string;
  status?: string;
  meta?: Record<string, unknown>;
  createdAt: string;
}

export interface SocialPostRecord {
  id: string;
  authorId: string;
  channelId?: string;
  content: string;
  mediaUrls: string[];
  likes: string[];
  createdAt: string;
}

export interface SocialCommentRecord {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  createdAt: string;
}

export interface SocialChannelRecord {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  members: string[];
  createdAt: string;
}

export interface DirectMessageRecord {
  id: string;
  roomId: string;
  senderId: string;
  content: string;
  createdAt: string;
}

export interface StreamRoomRecord {
  id: string;
  hostId: string;
  title: string;
  status: "live" | "ended";
  viewers: number;
  createdAt: string;
}

export interface VideoCallRoomRecord {
  id: string;
  name: string;
  ownerId: string;
  participants: string[];
  status: "open" | "closed";
  createdAt: string;
}

export interface LedgerEntryRecord {
  id: string;
  userId: string;
  kind: "credit" | "debit";
  amount: number;
  reason: string;
  createdAt: string;
}

export interface MembershipRecord {
  userId: string;
  tier: "free" | "creator" | "guardian" | "institutional";
  active: boolean;
  quota: number;
  updatedAt: string;
}

export interface TokenBalanceRecord {
  userId: string;
  balance: number;
  updatedAt: string;
}

export interface ProtocolRunRecord {
  id: string;
  protocolType: "hoyo-negro" | "fenix" | "futuros";
  state: "draft" | "running" | "completed" | "halted";
  ethicalCheck: "pass" | "review";
  context: string;
  createdAt: string;
  updatedAt: string;
}

export interface MsrEventRecord {
  id: string;
  layer: "L0" | "L1" | "L2" | "L3" | "L4" | "L5" | "L6" | "L7";
  category: string;
  summary: string;
  payload: Record<string, string | number | boolean>;
  createdAt: string;
}

export interface BookpiNarrativeRecord {
  id: string;
  title: string;
  narrative: string;
  tags: string[];
  createdAt: string;
}

export interface GuardianAlertRecord {
  id: string;
  level: "low" | "medium" | "high";
  source: string;
  message: string;
  createdAt: string;
}

export interface DreamspaceRecord {
  id: string;
  name: string;
  ownerId: string;
  visibility: "public" | "private";
  participants: string[];
  sceneProfile: "heritage" | "festival" | "nature";
  createdAt: string;
}

export const db = {
  users: new Map<string, UserRecord>(),
  usersByEmail: new Map<string, string>(),
  profiles: new Map<string, ProfileRecord>(),
  businesses: new Map<string, BusinessRecord>(),
  donations: new Map<string, DonationRecord>(),
  interactions: new Map<string, InteractionRecord>(),
  digitalTwins: new Map<string, TwinRecord>(),
  twinEvents: new Map<string, TwinEventRecord>(),
  socialPosts: new Map<string, SocialPostRecord>(),
  socialComments: new Map<string, SocialCommentRecord>(),
  socialChannels: new Map<string, SocialChannelRecord>(),
  directMessages: new Map<string, DirectMessageRecord>(),
  streamRooms: new Map<string, StreamRoomRecord>(),
  videoCallRooms: new Map<string, VideoCallRoomRecord>(),
  ledger: new Map<string, LedgerEntryRecord>(),
  memberships: new Map<string, MembershipRecord>(),
  tokenBalances: new Map<string, TokenBalanceRecord>(),
  protocolRuns: new Map<string, ProtocolRunRecord>(),
  msrEvents: new Map<string, MsrEventRecord>(),
  bookpiNarratives: new Map<string, BookpiNarrativeRecord>(),
  guardianAlerts: new Map<string, GuardianAlertRecord>(),
  dreamspaces: new Map<string, DreamspaceRecord>(),
};

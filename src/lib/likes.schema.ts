import * as v from 'valibot';

export const userSchema = v.object({
  id: v.number(),
  username: v.string(),
  permalink_url: v.string(),
  avatar_url: v.nullable(v.string()),
  followers_count: v.nullable(v.number()),
});

export const publisherMetadataSchema = v.object({
  artist: v.optional(v.nullable(v.string())),
});

export const trackSchema = v.object({
  id: v.number(),
  comment_count: v.nullable(v.number()),
  likes_count: v.nullable(v.number()),
  playback_count: v.nullable(v.number()),
  created_at: v.string(),
  title: v.string(),
  artwork_url: v.nullable(v.string()),
  permalink_url: v.string(),
  description: v.nullable(v.string()),
  user: userSchema,
  publisher_metadata: v.nullable(publisherMetadataSchema),
});

export const likeSchema = v.object({
  created_at: v.string(),
  track: trackSchema,
});

export const likesDataSchema = v.object({
  updated_at: v.string(),
  likes: v.array(likeSchema),
});

export type User = v.InferOutput<typeof userSchema>;
export type PublisherMetadata = v.InferOutput<typeof publisherMetadataSchema>;
export type Track = v.InferOutput<typeof trackSchema>;
export type Like = v.InferOutput<typeof likeSchema>;
export type LikesData = v.InferOutput<typeof likesDataSchema>;

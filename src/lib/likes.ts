import likes from './likes.json?url';
import type { LikesData } from './likes.schema';

export * from './likes.schema';

export async function loadLikes(): Promise<LikesData> {
  const res = await fetch(likes);
  return await res.json();
}

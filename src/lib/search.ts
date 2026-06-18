import Fuse from 'fuse.js';

import { type Like } from '@/lib/likes';
import { normalizeText } from '@/lib/utils';

export function createFuse(likes: Like[]) {
  const searchableData = likes.map((like) => ({
    original: like,
    title: normalizeText(like.track.title),
    artist: normalizeText(
      like.track.publisher_metadata?.artist || like.track.user.username,
    ),
    username: normalizeText(like.track.user.username),
    description: normalizeText(like.track.description || ''),
  }));

  return new Fuse(searchableData, {
    keys: [
      {
        name: 'title',
        weight: 2,
      },
      {
        name: 'artist',
        weight: 1.5,
      },
      {
        name: 'username',
        weight: 1.5,
      },
      {
        name: 'description',
        weight: 0.5,
      },
    ],
    threshold: 0.3,
    ignoreLocation: true,
    shouldSort: false,
    minMatchCharLength: 2,
  });
}

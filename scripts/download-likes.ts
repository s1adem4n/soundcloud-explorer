import { writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import * as v from 'valibot';

import { likesDataSchema, type LikesData } from '../src/lib/likes.schema.ts';

const API_BASE_URL = 'https://api-v2.soundcloud.com/';
const WEB_BASE_URL = 'https://soundcloud.com/';
const OUTPUT_PATH = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../src/lib/likes.json',
);
const REQUEST_HEADERS = {
  Origin: 'https://soundcloud.com',
  Referer: 'https://soundcloud.com/',
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36 Edg/114.0.1823.67',
};

type PaginatedResponse<T> = {
  collection?: T[];
  next_href?: string | null;
};

type SoundCloudUser = {
  id: number;
  username?: string;
};

type SoundCloudLike = {
  created_at?: unknown;
  track?: unknown;
};

type SoundCloudTrack = {
  id?: unknown;
};

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required`);
  }

  return value;
}

async function fetchText(url: string): Promise<string> {
  const response = await fetch(url, { headers: REQUEST_HEADERS });
  if (!response.ok) {
    throw new Error(
      `GET ${url} failed: ${response.status} ${await response.text()}`,
    );
  }

  return response.text();
}

async function getWebClientID(): Promise<string> {
  const html = await fetchText(WEB_BASE_URL);
  const scriptURLs = html.match(/https?:\/\/[^\s"]+\.js/g) ?? [];

  for (const scriptURL of scriptURLs) {
    const script = await fetchText(scriptURL);
    const match = script.match(/[{,]client_id:"(\w+)/);
    if (match?.[1]) {
      return match[1];
    }
  }

  throw new Error('could not find SoundCloud client_id');
}

async function fetchJSON<T>(
  pathOrURL: string,
  clientID: string,
  oauthToken: string,
): Promise<T> {
  const url = new URL(pathOrURL, API_BASE_URL);
  url.searchParams.set('client_id', clientID);

  const response = await fetch(url, {
    headers: {
      ...REQUEST_HEADERS,
      Authorization: `OAuth ${oauthToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(
      `GET ${url} failed: ${response.status} ${await response.text()}`,
    );
  }

  return response.json() as Promise<T>;
}

async function getCurrentUser(
  clientID: string,
  oauthToken: string,
): Promise<SoundCloudUser> {
  return fetchJSON<SoundCloudUser>('me', clientID, oauthToken);
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
}

function getTrackID(value: SoundCloudLike): number | undefined {
  const track = asRecord(value.track) as SoundCloudTrack | undefined;
  return typeof track?.id === 'number' ? track.id : undefined;
}

async function getAllLikes(
  userID: number,
  clientID: string,
  oauthToken: string,
): Promise<SoundCloudLike[]> {
  const likes: SoundCloudLike[] = [];
  const seenTrackIDs = new Set<number>();
  let nextPath: string | undefined = `users/${userID}/likes?limit=200`;

  while (nextPath) {
    const page: PaginatedResponse<SoundCloudLike> = await fetchJSON<
      PaginatedResponse<SoundCloudLike>
    >(nextPath, clientID, oauthToken);

    for (const rawLike of page.collection ?? []) {
      const trackID = getTrackID(rawLike);
      if (!trackID || seenTrackIDs.has(trackID)) {
        continue;
      }

      seenTrackIDs.add(trackID);
      likes.push(rawLike);
    }

    nextPath = page.next_href ?? undefined;
    console.log(`downloaded ${likes.length} likes`);
  }

  likes.reverse();
  return likes;
}

async function main() {
  const oauthToken = requiredEnv('SOUNDCLOUD_OAUTH_TOKEN');
  const clientID = await getWebClientID();
  const user = await getCurrentUser(clientID, oauthToken);
  const likes = await getAllLikes(user.id, clientID, oauthToken);
  const data: LikesData = v.parse(likesDataSchema, {
    updated_at: new Date().toISOString(),
    likes,
  });

  await writeFile(OUTPUT_PATH, `${JSON.stringify(data)}\n`);
  console.log(
    `wrote ${data.likes.length} likes for ${user.username ?? user.id} to ${OUTPUT_PATH}`,
  );
}

await main();

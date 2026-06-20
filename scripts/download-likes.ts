import { writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  SoundCloudClient,
  type SoundCloudLike,
  type SoundCloudUser,
} from '@slademan/soundcloud-ts';
import * as v from 'valibot';

import { likesDataSchema, type LikesData } from '../src/lib/likes.schema.ts';

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

async function getCurrentUser(
  client: SoundCloudClient,
): Promise<SoundCloudUser> {
  const user = await client.v2.request('GET /me');
  if (typeof user.id !== 'number') {
    throw new Error('GET /me did not return a SoundCloud user');
  }

  return user as SoundCloudUser;
}

function getNextOffset(nextHref?: string | null): string | undefined {
  if (!nextHref) {
    return;
  }

  return new URL(nextHref).searchParams.get('offset') ?? undefined;
}

async function getAllLikes(
  client: SoundCloudClient,
  clientID: string,
  userID: number,
): Promise<SoundCloudLike[]> {
  const likes: SoundCloudLike[] = [];
  const seenTrackIDs = new Set<number>();
  let offset: string | undefined;

  do {
    const page = await client.v2.request('GET /users/:userId/likes', {
      params: { userId: userID },
      query: {
        client_id: clientID,
        limit: 200,
        linked_partitioning: 1,
        offset,
      },
    });

    for (const rawLike of page.collection ?? []) {
      const trackID = rawLike.track?.id;
      if (!trackID || seenTrackIDs.has(trackID)) {
        continue;
      }

      seenTrackIDs.add(trackID);
      likes.push(rawLike);
    }

    offset = getNextOffset(page.next_href);
    console.log(`downloaded ${likes.length} likes`);
  } while (offset);

  likes.reverse();
  return likes;
}

async function main() {
  const oauthToken = requiredEnv('SOUNDCLOUD_OAUTH_TOKEN');
  const clientID = await getWebClientID();
  const client = new SoundCloudClient({
    accessToken: oauthToken,
    authScheme: 'OAuth',
    clientId: clientID,
    headers: REQUEST_HEADERS,
  });
  const user = await getCurrentUser(client);
  const likes = await getAllLikes(client, clientID, user.id);
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

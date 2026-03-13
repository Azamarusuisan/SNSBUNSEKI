import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { postTweet } from './poster';

export interface ScheduledPost {
  id: string;
  text: string;
  scheduledAt: string;
  platform: string;
  status: 'pending' | 'posted' | 'failed';
  createdAt: string;
  error?: string;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const QUEUE_PATH = path.join(DATA_DIR, 'scheduled-posts.json');

async function ensureDataDir(): Promise<void> {
  if (!existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR, { recursive: true });
  }
}

async function readQueue(): Promise<ScheduledPost[]> {
  await ensureDataDir();
  if (!existsSync(QUEUE_PATH)) {
    return [];
  }
  const raw = await readFile(QUEUE_PATH, 'utf-8');
  return JSON.parse(raw) as ScheduledPost[];
}

async function writeQueue(posts: ScheduledPost[]): Promise<void> {
  await ensureDataDir();
  await writeFile(QUEUE_PATH, JSON.stringify(posts, null, 2), 'utf-8');
}

export async function getQueue(): Promise<ScheduledPost[]> {
  return readQueue();
}

export async function schedulePost(
  text: string,
  scheduledAt: Date,
  platform: string
): Promise<ScheduledPost> {
  const post: ScheduledPost = {
    id: `sp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    text,
    scheduledAt: scheduledAt.toISOString(),
    platform,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  const queue = await readQueue();
  queue.push(post);
  await writeQueue(queue);

  return post;
}

export async function cancelPost(id: string): Promise<boolean> {
  const queue = await readQueue();
  const index = queue.findIndex(p => p.id === id);
  if (index === -1) return false;

  queue.splice(index, 1);
  await writeQueue(queue);
  return true;
}

export async function processQueue(): Promise<void> {
  const queue = await readQueue();
  const now = new Date();
  let changed = false;

  for (const post of queue) {
    if (post.status !== 'pending') continue;
    if (new Date(post.scheduledAt) > now) continue;

    try {
      if (post.platform === 'x') {
        await postTweet(post.text);
      } else {
        console.log(`[Scheduler] Platform "${post.platform}" not yet supported, skipping post ${post.id}`);
        continue;
      }
      post.status = 'posted';
      changed = true;
    } catch (err) {
      post.status = 'failed';
      post.error = err instanceof Error ? err.message : String(err);
      changed = true;
    }
  }

  if (changed) {
    await writeQueue(queue);
  }
}

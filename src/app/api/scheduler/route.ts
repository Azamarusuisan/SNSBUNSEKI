import { NextRequest, NextResponse } from 'next/server';
import { getQueue, schedulePost, cancelPost, processQueue } from '@/lib/x/scheduler';

export async function GET() {
  try {
    const queue = await getQueue();
    return NextResponse.json({ posts: queue });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to read queue' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as Record<string, unknown>;
    const { text, scheduledAt, platform } = body;

    if (typeof text !== 'string' || !text.trim()) {
      return NextResponse.json({ error: 'text is required' }, { status: 400 });
    }
    if (typeof scheduledAt !== 'string' || !scheduledAt) {
      return NextResponse.json({ error: 'scheduledAt is required' }, { status: 400 });
    }
    if (typeof platform !== 'string' || !platform) {
      return NextResponse.json({ error: 'platform is required' }, { status: 400 });
    }

    const date = new Date(scheduledAt);
    if (isNaN(date.getTime())) {
      return NextResponse.json({ error: 'Invalid scheduledAt date' }, { status: 400 });
    }

    const post = await schedulePost(text.trim(), date, platform);

    // Process any due posts
    await processQueue();

    return NextResponse.json({ post }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to schedule post' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const removed = await cancelPost(id);
    if (!removed) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to cancel post' },
      { status: 500 }
    );
  }
}

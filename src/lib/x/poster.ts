import { TwitterApi } from 'twitter-api-v2';

interface PostResult {
  id: string;
  text: string;
}

function isMockMode(): boolean {
  return !process.env.X_API_KEY;
}

function createClient(): TwitterApi {
  const apiKey = process.env.X_API_KEY;
  const apiSecret = process.env.X_API_SECRET;
  const accessToken = process.env.X_ACCESS_TOKEN;
  const accessSecret = process.env.X_ACCESS_SECRET;

  if (!apiKey || !apiSecret || !accessToken || !accessSecret) {
    throw new Error('X API credentials are not configured');
  }

  return new TwitterApi({
    appKey: apiKey,
    appSecret: apiSecret,
    accessToken,
    accessSecret,
  });
}

export async function postTweet(text: string): Promise<PostResult> {
  if (isMockMode()) {
    const mockId = `mock_${Date.now()}`;
    console.log(`[Mock] X post: ${text}`);
    return { id: mockId, text };
  }

  const client = createClient();
  const result = await client.v2.tweet(text);

  return {
    id: result.data.id,
    text: result.data.text,
  };
}

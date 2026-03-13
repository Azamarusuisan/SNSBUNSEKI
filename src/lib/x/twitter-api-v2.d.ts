declare module 'twitter-api-v2' {
  interface TwitterApiTokens {
    appKey: string;
    appSecret: string;
    accessToken: string;
    accessSecret: string;
  }

  interface TweetV2PostTweetResult {
    data: {
      id: string;
      text: string;
    };
  }

  interface TwitterApiReadWrite {
    tweet(text: string): Promise<TweetV2PostTweetResult>;
  }

  class TwitterApi {
    constructor(tokens: TwitterApiTokens);
    v2: TwitterApiReadWrite;
  }

  export { TwitterApi };
}

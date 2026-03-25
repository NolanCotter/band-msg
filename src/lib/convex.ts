export type ConvexSubscription = {
  unsubscribe: () => void;
  getCurrentValue: () => undefined;
};

type ConvexLike = {
  query: (..._args: any[]) => Promise<never>;
  mutation: (..._args: any[]) => Promise<never>;
  onUpdate: (..._args: any[]) => ConvexSubscription;
};

const noopConvexClient: ConvexLike = {
  async query() {
    throw new Error('Direct browser Convex access is disabled. Use cookie-backed server routes instead.');
  },
  async mutation() {
    throw new Error('Direct browser Convex access is disabled. Use cookie-backed server routes instead.');
  },
  onUpdate() {
    return {
      unsubscribe() {},
      getCurrentValue() {
        return undefined;
      }
    };
  }
};

export const convex: ConvexLike = noopConvexClient;

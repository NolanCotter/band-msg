import { writable } from 'svelte/store';
import { apiGet, apiPost } from '../utils/api';
import { pusherStore } from './pusher';

type Reaction = {
  emoji: string;
  count: number;
  users: string[];
};

type Message = {
  id: string;
  author: string;
  content: string;
  createdAt: number;
  editedAt?: number | null;
  reactions?: Reaction[];
  replyCount?: number;
};

type MessageState = {
  messages: Message[];
  isLoading: boolean;
  sessionToken: string | null;
  typingUsers: string[];
  error: string | null;
};

const MESSAGE_LOAD_TIMEOUT_MS = 8000;

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`${label} timed out after ${ms}ms`));
    }, ms);

    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      }
    );
  });
}

function createConvexMessageStore() {
  const { subscribe, set, update } = writable<MessageState>({
    messages: [],
    isLoading: false,
    sessionToken: null,
    typingUsers: [],
    error: null
  });

  let typingTimer: ReturnType<typeof setTimeout> | null = null;
  let currentMessageChannelId: string | null = null;
  let activeMessageRequestId = 0;
  let currentTypingChannelId: string | null = null;

  return {
    subscribe,

    setSessionToken(_token: string | null) {
      update(state => ({
        ...state,
        sessionToken: null,
        error: null,
        isLoading: false,
      }));
    },

    async loadMessages(channelId: string) {
      const requestId = ++activeMessageRequestId;
      currentMessageChannelId = null;
      update(state => ({ ...state, messages: [], isLoading: true, error: null }));

      try {
        const response = await withTimeout(
          apiGet(`/api/messages?channelId=${encodeURIComponent(channelId)}`),
          MESSAGE_LOAD_TIMEOUT_MS,
          `Loading messages for ${channelId}`
        );

        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          throw new Error(typeof body.error === 'string' ? body.error : 'Failed to load messages');
        }

        const initialMessages = await response.json();
        const messageIds = initialMessages.map((message: Message) => message.id);

        if (messageIds.length > 0) {
          const reactionsResponse = await apiGet(`/api/reactions?messageIds=${messageIds.join(',')}`);
          if (reactionsResponse.ok) {
            const reactionMap = await reactionsResponse.json();
            initialMessages.forEach((message: Message) => {
              message.reactions = reactionMap[message.id] || [];
            });
          }
        }

        if (requestId !== activeMessageRequestId) {
          return;
        }

        currentMessageChannelId = channelId;
        update(state => ({ ...state, messages: initialMessages, isLoading: false, error: null }));

        pusherStore.subscribeToChannel(channelId, {
          onNewMessage: (data) => {
            if (currentMessageChannelId !== channelId) return;
            update((state) => ({
              ...state,
              messages: [...state.messages.filter((message) => message.id !== data.id), data],
            }));
          },
          onMessageDeleted: (data) => {
            if (currentMessageChannelId !== channelId) return;
            update((state) => ({
              ...state,
              messages: state.messages.filter((message) => message.id !== data.messageId),
            }));
          },
          onReactionUpdate: (data) => {
            if (currentMessageChannelId !== channelId) return;
            update((state) => ({
              ...state,
              messages: state.messages.map((message) =>
                message.id === data.messageId
                  ? { ...message, reactions: data.reactions }
                  : message
              ),
            }));
          },
          onTyping: (data) => {
            if (currentMessageChannelId !== channelId) return;

            update((state) => {
              let typingUsers = state.typingUsers.filter((username) => username !== data.username);
              if (data.isTyping) {
                typingUsers = [...typingUsers, data.username];
              }

              return { ...state, typingUsers };
            });
          }
        });

        await this.subscribeToTyping(channelId);
      } catch (error) {
        console.error('[MessageStore] Error loading messages:', error);
        if (requestId === activeMessageRequestId) {
          update(state => ({
            ...state,
            isLoading: false,
            error: error instanceof Error ? error.message : 'We could not load this conversation. Retry to reconnect.',
          }));
        }
      }
    },

    clearMessages() {
      currentMessageChannelId = null;
      update(state => ({ ...state, messages: [], isLoading: false, error: null }));
    },

    async sendMessage(channelId: string, content: string, replyToId?: string) {
      try {
        const response = await apiPost('/api/messages', {
          channelId,
          content,
          replyToId,
        });

        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          return { success: false, error: typeof body.error === 'string' ? body.error : 'Failed to send message' };
        }

        return { success: true };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    },

    async createReport(message: string) {
      const response = await apiPost('/api/reports', { message });

      if (!response.ok) {
        throw new Error('Failed to submit report');
      }
    },

    async deleteMessage(messageId: string, _channelId: string) {
      try {
        const response = await apiPost('/api/messages', { messageId }, 'DELETE');
        if (!response.ok) {
          return { success: false };
        }
        return { success: true };
      } catch (error) {
        return { success: false };
      }
    },

    async editMessage(_messageId: string, _content: string) {
      return { success: false, error: "Message editing is temporarily unavailable during the security update." };
    },

    async addReaction(messageId: string, emoji: string, _channelId: string) {
      try {
        await apiPost('/api/reactions', {
          messageId,
          emoji,
          action: 'add'
        });
      } catch (error) {
        console.error('Failed to add reaction:', error);
      }
    },

    async removeReaction(messageId: string, emoji: string, _channelId: string) {
      try {
        await apiPost('/api/reactions', {
          messageId,
          emoji,
          action: 'remove'
        });
      } catch (error) {
        console.error('Failed to remove reaction:', error);
      }
    },

    async setTyping(channelId: string) {
      try {
        await apiPost('/api/typing', { channelId, action: 'start' });

        // Reset the typing timeout
        if (typingTimer) {
          clearTimeout(typingTimer);
        }
        typingTimer = setTimeout(() => {
          this.stopTyping(channelId);
        }, 3000);
      } catch (error) {
        console.error('[setTyping] Error:', error);
      }
    },

    async stopTyping(channelId: string) {
      try {
        if (typingTimer) {
          clearTimeout(typingTimer);
          typingTimer = null;
        }
        await apiPost('/api/typing', { channelId, action: 'stop' });
      } catch (error) {
        console.error('[stopTyping] Error:', error);
      }
    },

    async subscribeToTyping(channelId: string) {
      currentTypingChannelId = channelId;
      try {
        const response = await apiGet(`/api/typing?channelId=${encodeURIComponent(channelId)}`);
        if (!response.ok || currentTypingChannelId !== channelId) {
          return;
        }

        const usernames = await response.json();
        update(state => ({ ...state, typingUsers: Array.isArray(usernames) ? usernames : [] }));
      } catch {
        update(state => ({ ...state, typingUsers: [] }));
      }
    },

    unsubscribeFromTyping() {
      currentTypingChannelId = null;
      update(state => ({ ...state, typingUsers: [] }));
    },

    cleanup() {
      activeMessageRequestId += 1;
      currentTypingChannelId = null;
      currentMessageChannelId = null;
    }
  };
}

export const convexMessageStore = createConvexMessageStore();

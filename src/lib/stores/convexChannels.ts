import { writable } from 'svelte/store';
import { apiGet } from '../utils/api';

type Channel = {
  id: string;
  name: string;
  description: string;
  isPrivate?: boolean;
};

type ChannelState = {
  channels: Channel[];
  selectedChannelId: string | null;
  isLoading: boolean;
  error: string | null;
};

const CHANNEL_LOAD_TIMEOUT_MS = 8000;

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

function createConvexChannelStore() {
  const { subscribe, set, update } = writable<ChannelState>({
    channels: [],
    selectedChannelId: null,
    isLoading: false,
    error: null,
  });

  let _selectedChannelId: string | null = null;

  function resolveSelectedChannelId(channels: Channel[]) {
    if (_selectedChannelId && channels.some((channel) => channel.id === _selectedChannelId)) {
      return _selectedChannelId;
    }

    _selectedChannelId = channels[0]?.id ?? null;
    return _selectedChannelId;
  }

  return {
    subscribe,

    setSessionToken(_token: string | null) {
      // Kept as a no-op during the security lock-down so older components don't break.
    },

    async loadChannels() {
      update((state) => ({
        ...state,
        isLoading: true,
        error: null,
      }));

      try {
        const response = await withTimeout(
          apiGet('/api/channels'),
          CHANNEL_LOAD_TIMEOUT_MS,
          'Loading channels'
        );

        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          throw new Error(typeof body.error === 'string' ? body.error : 'Failed to load channels');
        }

        const channels = await response.json();
        const selectedChannelId = resolveSelectedChannelId(channels);

        update((state) => ({
          ...state,
          channels,
          selectedChannelId,
          isLoading: false,
          error: null,
        }));
        return channels;
      } catch (error) {
        console.error('[ChannelStore] Error loading channels:', error);
        update((state) => ({
          ...state,
          channels: [],
          selectedChannelId: null,
          isLoading: false,
          error: error instanceof Error ? error.message : 'We could not load your channels. Retry to reconnect.',
        }));
        return [];
      }
    },

    selectChannel(channelId: string) {
      _selectedChannelId = channelId;
      update(state => ({ ...state, selectedChannelId: channelId, error: null }));
    },

    cleanup() {
      // No-op for the cookie-backed version.
    }
  };
}

export const convexChannelStore = createConvexChannelStore();

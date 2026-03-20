import { writable } from 'svelte/store';
import { convex } from '../convex';
import { api } from '../../../convex/_generated/api';

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
};

function createConvexChannelStore() {
  const { subscribe, set, update } = writable<ChannelState>({
    channels: [],
    selectedChannelId: null,
    isLoading: false,
  });

  let currentSessionToken: string | null = null;
  let unsubscribe: (() => void) | null = null;
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

    setSessionToken(token: string | null) {
      currentSessionToken = token;
    },

    async loadChannels() {
      if (!currentSessionToken) {
        console.error('[Convex Channels] No session token available for loading channels');
        return;
      }

      console.log('[Convex Channels] Loading channels with session token:', currentSessionToken.substring(0, 10) + '...');
      update(state => ({ ...state, isLoading: true }));
      
      try {
        // Unsubscribe from previous subscription
        if (unsubscribe) {
          unsubscribe();
          unsubscribe = null;
        }

        // First, get initial channels with a query
        const initialChannels = await convex.query(api.channels.list, {
          sessionToken: currentSessionToken
        });
        console.log('[Convex Channels] Initial channels loaded:', initialChannels.length, 'channels');

        const selectedChannelId = resolveSelectedChannelId(initialChannels);

        update(state => ({
          ...state,
          channels: initialChannels,
          selectedChannelId,
          isLoading: false,
        }));

        // Then subscribe to real-time updates
        unsubscribe = convex.onUpdate(
          api.channels.list,
          { sessionToken: currentSessionToken },
          (channels) => {
            console.log('[Convex Channels] Channels updated:', channels.length, 'channels');
            const selectedChannelId = resolveSelectedChannelId(channels);

            console.log('[Convex Channels] Selected channel:', selectedChannelId);
            
            update(state => ({
              ...state,
              channels,
              selectedChannelId,
              isLoading: false,
            }));
          }
        );
      } catch (error) {
        console.error('[Convex Channels] Error loading channels:', error);
        update(state => ({ ...state, isLoading: false }));
      }
    },

    selectChannel(channelId: string) {
      console.log('[Convex Channels] Selecting channel:', channelId);
      _selectedChannelId = channelId;
      update(state => ({ ...state, selectedChannelId: channelId }));
    },

    cleanup() {
      if (unsubscribe) {
        unsubscribe();
        unsubscribe = null;
      }
    }
  };
}

export const convexChannelStore = createConvexChannelStore();

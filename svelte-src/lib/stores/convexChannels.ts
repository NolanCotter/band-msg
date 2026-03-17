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

        // Subscribe to real-time channel updates
        unsubscribe = convex.onUpdate(
          api.channels.list,
          { sessionToken: currentSessionToken },
          (channels) => {
            console.log('[Convex Channels] Channels updated:', channels.length, 'channels');
            
            update(state => {
              // If no channel is selected, select the first one
              const newSelectedId = state.selectedChannelId || (channels[0]?.id ?? null);
              console.log('[Convex Channels] Selected channel:', newSelectedId);
              
              return {
                ...state,
                channels,
                selectedChannelId: newSelectedId,
                isLoading: false,
              };
            });
          }
        );
      } catch (error) {
        console.error('[Convex Channels] Error loading channels:', error);
        update(state => ({ ...state, isLoading: false }));
      }
    },

    selectChannel(channelId: string) {
      console.log('[Convex Channels] Selecting channel:', channelId);
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

import { writable } from 'svelte/store';
import { apiGet } from '../utils/api';

type Member = {
  id: string;
  username: string;
  role: string;
  presenceStatus: 'online' | 'idle' | 'dnd' | 'offline';
};

type MemberState = {
  members: Member[];
  showUserList: boolean;
};

function createMemberStore() {
  const { subscribe, set, update } = writable<MemberState>({
    members: [],
    showUserList: true,
  });

  return {
    subscribe,

    async loadMembers() {
      // For now, we'll use mock data since the API needs a serverId
      // In a real implementation, you'd get the serverId from the server store
      const mockMembers: Member[] = [
        { id: '1', username: 'You', role: 'Band Leader', presenceStatus: 'online' },
        { id: '2', username: 'Jules', role: 'Vocals', presenceStatus: 'online' },
        { id: '3', username: 'Miko', role: 'Drums', presenceStatus: 'idle' },
        { id: '4', username: 'Dex', role: 'Guitar', presenceStatus: 'online' },
        { id: '5', username: 'Zo', role: 'Keys', presenceStatus: 'dnd' },
        { id: '6', username: 'Remy', role: 'Bass', presenceStatus: 'online' },
        { id: '7', username: 'Tara', role: 'Manager', presenceStatus: 'offline' },
      ];
      update(state => ({ ...state, members: mockMembers }));
    },

    toggleUserList() {
      update(state => ({ ...state, showUserList: !state.showUserList }));
    },

    setShowUserList(show: boolean) {
      update(state => ({ ...state, showUserList: show }));
    },
  };
}

export const memberStore = createMemberStore();

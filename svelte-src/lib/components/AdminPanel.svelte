<script lang="ts">
  import { onMount } from 'svelte';
  import { authStore } from '../stores/auth';
  import { apiGet, apiPost } from '../utils/api';

  export let onClose: () => void;

  type PendingUser = {
    id: string;
    username: string;
    role: string;
    status: string;
    createdAt: number;
  };

  let pendingUsers: PendingUser[] = [];
  let allUsers: any[] = [];
  let isLoading = false;
  let activeTab: 'pending' | 'users' = 'pending';

  onMount(async () => {
    await loadPendingUsers();
    await loadAllUsers();
  });

  async function loadPendingUsers() {
    isLoading = true;
    try {
      const res = await apiGet('/api/admin/users');
      if (res.ok) {
        pendingUsers = await res.json();
      }
    } finally {
      isLoading = false;
    }
  }

  async function loadAllUsers() {
    // This would need a new endpoint, for now we'll just show pending
    allUsers = [];
  }

  async function approveUser(username: string) {
    const res = await apiPost('/api/admin/users/approve', { username });
    if (res.ok) {
      await loadPendingUsers();
    }
  }

  async function rejectUser(username: string) {
    const res = await apiPost('/api/admin/users/reject', { username });
    if (res.ok) {
      await loadPendingUsers();
    }
  }

  async function promoteUser(username: string) {
    const res = await apiPost('/api/admin/users/promote', { username });
    if (res.ok) {
      await loadPendingUsers();
    }
  }

  async function demoteUser(username: string) {
    const res = await apiPost('/api/admin/users/demote', { username });
    if (res.ok) {
      await loadPendingUsers();
    }
  }
</script>

<div class="fixed inset-0 bg-black/80 flex items-center justify-center z-[200] p-4" style="padding-top: env(safe-area-inset-top); padding-bottom: env(safe-area-inset-bottom);">
  <div class="bg-[#111] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
    <!-- Header -->
    <div class="flex items-center justify-between p-4 border-b border-white/10">
      <h2 class="text-xl font-bold text-white">Admin Panel</h2>
      <button
        type="button"
        on:click={onClose}
        class="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>

    <!-- Tabs -->
    <div class="flex border-b border-white/10">
      <button
        type="button"
        on:click={() => activeTab = 'pending'}
        class="flex-1 px-4 py-3 text-sm font-medium transition-colors {activeTab === 'pending' ? 'text-white border-b-2 border-white' : 'text-white/40 hover:text-white/60'}"
      >
        Pending Approvals ({pendingUsers.length})
      </button>
      <button
        type="button"
        on:click={() => activeTab = 'users'}
        class="flex-1 px-4 py-3 text-sm font-medium transition-colors {activeTab === 'users' ? 'text-white border-b-2 border-white' : 'text-white/40 hover:text-white/60'}"
      >
        All Users
      </button>
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto p-4">
      {#if activeTab === 'pending'}
        {#if isLoading}
          <div class="text-center py-8 text-white/40">Loading...</div>
        {:else if pendingUsers.length === 0}
          <div class="text-center py-8 text-white/40">No pending approvals</div>
        {:else}
          <div class="space-y-2">
            {#each pendingUsers as user}
              <div class="bg-white/5 border border-white/10 rounded-lg p-4">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="font-medium text-white">{user.username}</p>
                    <p class="text-sm text-white/40">
                      Requested {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div class="flex gap-2">
                    <button
                      type="button"
                      on:click={() => approveUser(user.username)}
                      class="px-4 py-2 bg-white text-black rounded-lg hover:bg-white/90 transition-colors text-sm font-medium"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      on:click={() => rejectUser(user.username)}
                      class="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors text-sm font-medium"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      {:else}
        <div class="text-center py-8 text-white/40">
          User management coming soon
        </div>
      {/if}
    </div>
  </div>
</div>

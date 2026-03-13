<script lang="ts">
  import { memberStore } from '../stores/members';

  const statusColors: Record<string, string> = {
    online: 'bg-emerald-500',
    idle: 'bg-amber-500',
    dnd: 'bg-rose-500',
    offline: 'bg-white/20',
  };

  const statusLabels: Record<string, string> = {
    online: 'Online',
    idle: 'Away',
    dnd: 'In Session',
    offline: 'Offline',
  };

  $: grouped = {
    online: $memberStore.members.filter(u => u.presenceStatus === 'online'),
    idle: $memberStore.members.filter(u => u.presenceStatus === 'idle'),
    dnd: $memberStore.members.filter(u => u.presenceStatus === 'dnd'),
    offline: $memberStore.members.filter(u => u.presenceStatus === 'offline'),
  };

  function getAvatarColor(name: string): string {
    const colors = ['#7c3aed', '#2563eb', '#e11d48', '#059669', '#d97706', '#db2777'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }
</script>

{#if $memberStore.showUserList}
  <div class="hidden md:flex flex-col w-56 bg-[#0e0e10] border-l border-white/[0.04] overflow-hidden">
    <div class="h-14 flex items-center px-4 border-b border-white/[0.04] shrink-0">
      <h3 class="text-[12px] font-semibold text-white/30 uppercase tracking-widest">
        Band Members
      </h3>
    </div>
    <div class="flex-1 overflow-y-auto py-3 px-3 scrollbar-hide">
      {#each Object.entries(grouped) as [status, users]}
        {#if users.length > 0}
          <div class="mb-4">
            <h4 class="text-[11px] font-semibold text-white/25 uppercase tracking-widest px-2 mb-2">
              {statusLabels[status]} — {users.length}
            </h4>
            <div class="space-y-0.5">
              {#each users as user}
                <button class="flex items-center gap-2.5 w-full px-2 py-1.5 rounded-lg hover:bg-white/[0.04] transition-colors group">
                  <div class="relative shrink-0">
                    <div
                      class="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold {status === 'offline' ? 'bg-white/[0.04]' : 'bg-white/[0.06]'}"
                      style={status !== 'offline' ? `background: ${getAvatarColor(user.username)};` : ''}
                    >
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div class="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#0e0e10] {statusColors[status]}" />
                  </div>
                  <div class="flex-1 min-w-0 text-left">
                    <p class="text-[13px] font-medium truncate {status === 'offline' ? 'text-white/30' : 'text-white/70'}">
                      {user.username}
                    </p>
                    <p class="text-[10px] text-white/20 truncate">{user.role}</p>
                  </div>
                </button>
              {/each}
            </div>
          </div>
        {/if}
      {/each}
    </div>
  </div>
{/if}

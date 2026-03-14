<script lang="ts">
  import { channelStore } from '../stores/channels';
  import { messageStore } from '../stores/messages';

  async function selectChannel(channelId: string) {
    channelStore.selectChannel(channelId);
    await messageStore.loadMessages(channelId);
  }
</script>

<style>
  .channel-sidebar {
    display: none;
    background-color: #0a0a0a;
    border-right: 1px solid rgba(255, 255, 255, 0.1);
    flex-direction: column;
    width: 240px;
    min-width: 240px;
    max-width: 240px;
    flex-shrink: 0;
    padding-top: env(safe-area-inset-top);
    padding-bottom: env(safe-area-inset-bottom);
  }
  
  @media (min-width: 768px) {
    .channel-sidebar {
      display: flex;
    }
  }
</style>

<div class="channel-sidebar">
  <!-- Server header -->
  <div class="h-14 flex items-center px-4 border-b border-white/10 shrink-0">
    <h2 class="text-[15px] font-semibold text-white">Band Chat</h2>
  </div>

  <!-- Channels list -->
  <div class="flex-1 overflow-y-auto py-3 scrollbar-hide">
    <div class="px-2">
      <h3 class="text-[11px] font-semibold text-white/25 uppercase tracking-widest px-2 mb-2">
        Text Channels
      </h3>
      <div class="space-y-0.5">
        {#each $channelStore.channels as channel}
          <button
            type="button"
            on:click={() => selectChannel(channel.id)}
            class="flex items-center gap-2 w-full px-2 py-1.5 rounded-lg transition-colors {$channelStore.selectedChannelId === channel.id ? 'bg-white/10 text-white' : 'text-white/50 hover:bg-white/5 hover:text-white/70'}"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span class="text-[14px] font-medium truncate">{channel.name}</span>
          </button>
        {/each}
      </div>
    </div>
  </div>
</div>

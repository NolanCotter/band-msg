<script lang="ts">
  import { onMount, afterUpdate } from 'svelte';
  import { authStore } from '../stores/auth';
  import { channelStore } from '../stores/channels';
  import { messageStore } from '../stores/messages';
  import { memberStore } from '../stores/members';
  import MessageBubble from './MessageBubble.svelte';
  
  let messageInput = '';
  let messageContainer: HTMLDivElement;
  let typingTimeout: ReturnType<typeof setTimeout> | null = null;

  $: selectedChannel = $channelStore.channels.find(
    c => c.id === $channelStore.selectedChannelId
  );

  function scrollToBottom() {
    setTimeout(() => {
      if (messageContainer) {
        messageContainer.scrollTop = messageContainer.scrollHeight;
      }
    }, 50);
  }

  afterUpdate(() => {
    scrollToBottom();
  });

  async function handleSend() {
    if (!messageInput.trim() || !$channelStore.selectedChannelId) return;
    
    // Stop typing indicator
    if (typingTimeout) {
      clearTimeout(typingTimeout);
      typingTimeout = null;
    }
    await messageStore.stopTyping($channelStore.selectedChannelId);
    
    const result = await messageStore.sendMessage(
      $channelStore.selectedChannelId,
      messageInput
    );
    
    if (result.success) {
      messageInput = '';
    }
  }

  async function handleTyping() {
    if (!$channelStore.selectedChannelId || !messageInput.trim()) return;
    
    await messageStore.startTyping($channelStore.selectedChannelId);
    
    if (typingTimeout) clearTimeout(typingTimeout);
    typingTimeout = setTimeout(async () => {
      if ($channelStore.selectedChannelId) {
        await messageStore.stopTyping($channelStore.selectedChannelId);
      }
      typingTimeout = null;
    }, 3000);
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }
</script>

<div class="flex-1 flex flex-col min-w-0 bg-[#111113]">
  <!-- Header -->
  <div class="h-14 flex items-center justify-between px-4 border-b border-white/[0.04] shrink-0">
    <div class="flex items-center gap-3">
      <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-400 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-500/10 text-white">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
      </div>
      <div>
        <h3 class="text-[15px] font-semibold text-white tracking-tight leading-tight">
          #{selectedChannel?.name || 'general'}
        </h3>
        <p class="text-[11px] text-white/30 leading-tight">
          {selectedChannel?.description || 'Band chat'}
        </p>
      </div>
    </div>
    <div class="flex items-center gap-1">
      <button
        on:click={() => memberStore.toggleUserList()}
        class="p-2 rounded-lg transition-colors {$memberStore.showUserList ? 'text-white/60 bg-white/[0.06]' : 'text-white/20 hover:text-white/40 hover:bg-white/[0.05]'}"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      </button>
    </div>
  </div>

  <!-- Messages -->
  <div bind:this={messageContainer} class="flex-1 overflow-y-auto py-4 scrollbar-hide">
    <!-- Welcome message -->
    <div class="px-4 md:px-5 mb-6">
      <div class="w-16 h-16 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-3 text-orange-400/60">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
      </div>
      <h2 class="text-2xl font-bold text-white mb-1">
        #{selectedChannel?.name || 'general'}
      </h2>
      <p class="text-sm text-white/30">
        {selectedChannel?.description || 'Your band\'s space. Talk, plan, and make music together.'}
      </p>
    </div>

    <div class="h-px bg-white/[0.04] mx-4 mb-4" />

    {#each $messageStore.messages as message, i}
      {@const prev = i > 0 ? $messageStore.messages[i - 1] : null}
      {@const showHeader = !prev || prev.author !== message.author || message.createdAt - prev.createdAt > 300000}
      <MessageBubble {message} {showHeader} />
    {/each}

    {#if $messageStore.typingUsers.length > 0}
      <div class="px-4 md:px-5 mt-2">
        <p class="text-sm text-white/40">
          {$messageStore.typingUsers.join(', ')} {$messageStore.typingUsers.length === 1 ? 'is' : 'are'} typing...
        </p>
      </div>
    {/if}

    <div class="h-4" />
  </div>

  <!-- Input area -->
  <div class="px-4 pb-4 md:pb-5 shrink-0">
    <div class="relative flex items-center bg-white/[0.04] border border-white/[0.06] rounded-2xl overflow-hidden transition-all focus-within:border-orange-500/20 focus-within:bg-white/[0.06]">
      <input
        type="text"
        bind:value={messageInput}
        on:input={handleTyping}
        on:keydown={handleKeyDown}
        placeholder="Message the band..."
        maxlength="2000"
        class="flex-1 bg-transparent text-[14.5px] text-white placeholder:text-white/20 outline-none py-3 px-4 min-w-0"
        autocomplete="off"
      />
      <button
        on:click={handleSend}
        disabled={!messageInput.trim()}
        class="p-3 transition-colors shrink-0 {messageInput.trim() ? 'text-orange-400 hover:text-orange-300' : 'text-white/10'}"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="22" y1="2" x2="11" y2="13" />
          <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
      </button>
    </div>
  </div>

  <!-- User panel at bottom -->
  <div class="h-14 flex items-center gap-2.5 px-4 bg-[#09090b] border-t border-white/[0.04] shrink-0">
    <div class="relative">
      <div class="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-amber-600 flex items-center justify-center text-white text-sm font-semibold">
        {$authStore.user?.username.charAt(0).toUpperCase()}
      </div>
      <div class="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#09090b]" />
    </div>
    <div class="flex-1 min-w-0">
      <p class="text-[13px] font-medium text-white truncate">{$authStore.user?.username}</p>
      <p class="text-[11px] text-white/30">{$authStore.user?.role}</p>
    </div>
  </div>
</div>

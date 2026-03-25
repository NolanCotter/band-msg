<script lang="ts">
  import { onMount } from 'svelte';
  import { Drawer } from 'vaul-svelte';
  import { fade } from 'svelte/transition';
  import { apiGet, apiPost } from '../utils/api';
  import { parseMarkdown } from '$lib/markdown';
  import { vibrateSuccess } from '../utils/haptics';
  import Avatar from './Avatar.svelte';

  export let parentMessage: any;
  export let onClose: () => void;

  let replies: any[] = [];
  let replyInput = '';
  let isLoading = false;
  let messageContainer: HTMLDivElement;

  function getAvatarColor(name: string): string {
    const colors = ['#7c3aed', '#2563eb', '#e11d48', '#059669', '#d97706', '#db2777'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }

  function formatTime(timestamp: number): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 86400000) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString();
  }

  async function loadReplies() {
    isLoading = true;
    try {
      const response = await apiGet(`/api/threads/${encodeURIComponent(parentMessage.id)}`);
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(typeof body.error === 'string' ? body.error : 'Failed to load replies');
      }

      replies = await response.json();
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error('[ThreadPanel] Failed to load replies:', error);
    } finally {
      isLoading = false;
    }
  }

  async function sendReply() {
    if (!replyInput.trim()) return;

    try {
      const response = await apiPost('/api/messages', {
        channelId: parentMessage.channelId,
        content: replyInput.trim(),
        replyToId: parentMessage.id
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(typeof body.error === 'string' ? body.error : 'Failed to send reply');
      }

      vibrateSuccess();
      replyInput = '';
      await loadReplies();
    } catch (error) {
      console.error('[ThreadPanel] Failed to send reply:', error);
      alert(`Failed to send reply: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendReply();
    }
  }

  function scrollToBottom() {
    document.querySelectorAll<HTMLElement>('[data-thread-scroll]').forEach((container) => {
      container.scrollTop = container.scrollHeight;
    });
  }

  onMount(() => {
    loadReplies();
  });
</script>

<!-- Mobile: Bottom sheet drawer (shown on mobile via CSS) -->
<Drawer.Root open={true} onOpenChange={(open) => { if (!open) onClose(); }}>
  <Drawer.Portal>
    <Drawer.Overlay class="fixed inset-0 bg-black/80 z-[200] md:hidden" transition={fade} transitionConfig={{ duration: 150 }} />
    <Drawer.Content class="fixed bottom-0 left-0 right-0 z-[201] flex flex-col bg-[#1a1a1a] rounded-t-[20px] max-h-[85vh] md:hidden outline-none" style="padding-bottom: env(safe-area-inset-bottom);">
      <div class="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-white/20 my-3"></div>
      
      <div class="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0">
        <h3 class="text-[15px] font-semibold text-white">Thread</h3>
        <button
          type="button"
          on:click={onClose}
          class="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors active:scale-95"
          aria-label="Close thread"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div class="px-4 py-3 border-b border-white/10 shrink-0">
        <div class="flex gap-3">
          <Avatar alt={parentMessage.author} size="sm" status={null} />
          <div class="flex-1 min-w-0">
            <div class="flex items-baseline gap-2 mb-0.5">
              <span class="text-[13px] font-semibold" style="color: {getAvatarColor(parentMessage.author)};">
                {parentMessage.author}
              </span>
              <span class="text-[10px] text-white/40 font-medium">
                {formatTime(parentMessage.createdAt)}
              </span>
            </div>
            <div class="text-[13px] text-white/80 leading-relaxed break-words whitespace-pre-wrap">
              {@html parseMarkdown(parentMessage.content)}
            </div>
          </div>
        </div>
        <div class="mt-2 text-[12px] text-white/40 font-medium">
          {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
        </div>
      </div>

      <div bind:this={messageContainer} data-thread-scroll class="flex-1 overflow-y-auto py-2 scrollbar-hide">
        {#if isLoading}
          <div class="flex items-center justify-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-white/20"></div>
          </div>
        {:else if replies.length === 0}
          <div class="flex flex-col items-center justify-center py-8 text-white/30">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="mb-2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <p class="text-sm">No replies yet</p>
          </div>
        {:else}
          {#each replies as reply}
            <div class="px-4 py-2 hover:bg-white/[0.02]">
              <div class="flex gap-2.5">
                <Avatar alt={reply.author} size="sm" status={null} />
                <div class="flex-1 min-w-0">
                  <div class="flex items-baseline gap-2 mb-0.5">
                    <span class="text-[12px] font-semibold" style="color: {getAvatarColor(reply.author)};">
                      {reply.author}
                    </span>
                    <span class="text-[10px] text-white/40 font-medium">
                      {formatTime(reply.createdAt)}
                    </span>
                  </div>
                  <div class="text-[13px] text-white/80 leading-relaxed break-words whitespace-pre-wrap">
                    {@html parseMarkdown(reply.content)}
                  </div>
                </div>
              </div>
            </div>
          {/each}
        {/if}
      </div>

      <form class="px-4 pb-4 pt-2 border-t border-white/10 shrink-0" on:submit|preventDefault={sendReply}>
        <div class="flex items-end gap-2">
          <textarea
            bind:value={replyInput}
            on:keydown={handleKeyDown}
            placeholder="Reply..."
            rows="1"
            class="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-white/30 outline-none focus:border-white/30 resize-none transition-colors min-h-[44px] max-h-[120px]"
          ></textarea>
          <button
            type="submit"
            disabled={!replyInput.trim()}
            class="p-3 rounded-xl transition-all duration-200 shrink-0 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed {replyInput.trim() ? 'bg-white text-black active:bg-white/90' : 'bg-white/5 text-white/20'}"
            aria-label="Send reply"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </form>
    </Drawer.Content>
  </Drawer.Portal>
</Drawer.Root>

<!-- Desktop: Side panel -->
<div class="hidden md:flex fixed inset-0 z-[200] pointer-events-none">
  <div 
    class="absolute inset-0 bg-black/60 pointer-events-auto"
    on:click={onClose}
    on:keydown={(e) => e.key === 'Escape' && onClose()}
    role="button"
    tabindex="-1"
    aria-label="Close thread"
  ></div>
  
  <div class="absolute right-0 top-0 bottom-0 w-full max-w-2xl bg-[#1a1a1a] border-l border-white/10 flex flex-col animate-slide-left pointer-events-auto" style="padding-top: env(safe-area-inset-top); padding-bottom: env(safe-area-inset-bottom);">
    <div class="h-14 flex items-center justify-between px-4 border-b border-white/10 shrink-0">
      <h3 class="text-[15px] font-semibold text-white">Thread</h3>
      <button
        type="button"
        on:click={onClose}
        class="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors"
        aria-label="Close thread"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>

    <div class="px-4 py-4 border-b border-white/10">
      <div class="flex gap-3">
        <Avatar alt={parentMessage.author} size="md" status={null} />
        <div class="flex-1 min-w-0">
          <div class="flex items-baseline gap-2 mb-0.5">
            <span class="text-[14px] font-semibold" style="color: {getAvatarColor(parentMessage.author)};">
              {parentMessage.author}
            </span>
            <span class="text-[11px] text-white/40 font-medium">
              {formatTime(parentMessage.createdAt)}
            </span>
          </div>
          <div class="text-[14.5px] text-white/80 leading-relaxed break-words whitespace-pre-wrap">
            {@html parseMarkdown(parentMessage.content)}
          </div>
        </div>
      </div>
      <div class="mt-2 text-[13px] text-white/40 font-medium">
        {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
      </div>
    </div>

    <div data-thread-scroll class="flex-1 overflow-y-auto py-3 scrollbar-hide">
      {#if isLoading}
        <div class="flex items-center justify-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-white/20"></div>
        </div>
      {:else if replies.length === 0}
        <div class="flex flex-col items-center justify-center py-8 text-white/30">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="mb-2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <p class="text-sm">No replies yet</p>
        </div>
      {:else}
        {#each replies as reply}
          <div class="px-4 py-2 hover:bg-white/[0.02]">
            <div class="flex gap-3">
              <Avatar alt={reply.author} size="sm" status={null} />
              <div class="flex-1 min-w-0">
                <div class="flex items-baseline gap-2 mb-0.5">
                  <span class="text-[13px] font-semibold" style="color: {getAvatarColor(reply.author)};">
                    {reply.author}
                  </span>
                  <span class="text-[10px] text-white/40 font-medium">
                    {formatTime(reply.createdAt)}
                  </span>
                </div>
                <div class="text-[14px] text-white/80 leading-relaxed break-words whitespace-pre-wrap">
                  {@html parseMarkdown(reply.content)}
                </div>
              </div>
            </div>
          </div>
        {/each}
      {/if}
    </div>

    <form class="px-4 pb-4 pt-2 border-t border-white/10 shrink-0" on:submit|preventDefault={sendReply}>
      <div class="flex items-end gap-2">
        <textarea
          bind:value={replyInput}
          on:keydown={handleKeyDown}
          placeholder="Reply to thread..."
          rows="1"
          class="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-white/30 outline-none focus:border-white/30 resize-none transition-colors min-h-[44px] max-h-[120px]"
        ></textarea>
        <button
          type="submit"
          disabled={!replyInput.trim()}
          class="p-3 rounded-xl transition-all duration-200 shrink-0 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed {replyInput.trim() ? 'bg-white text-black active:bg-white/90' : 'bg-white/5 text-white/20'}"
          aria-label="Send reply"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </form>
  </div>
</div>

<style>
  @keyframes slide-left {
    from { transform: translateX(100%); }
    to { transform: translateX(0); }
  }
  .animate-slide-left {
    animation: slide-left 250ms cubic-bezier(0.16, 1, 0.3, 1);
  }
</style>

<script lang="ts">
  import { tick } from 'svelte';
  import { Drawer } from 'vaul-svelte';
  import { authStore } from '../stores/auth';
  import { convexMessageStore as messageStore } from '../stores/convexMessages';
  import { convexChannelStore } from '../stores/convexChannels';
  import { parseMarkdown } from '$lib/markdown';
  import { vibrateMedium } from '../utils/haptics';
  import Avatar from './Avatar.svelte';
  import { fly } from 'svelte/transition';

  export let message: any;
  export let showHeader: boolean;
  export let onOpenThread: ((message: any) => void) | null = null;

  function getAvatarColor(name: string): string {
    const colors = ['#7c3aed', '#2563eb', '#e11d48', '#059669', '#d97706', '#db2777'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }

  $: isOwn = message.author === $authStore.user?.username;
  $: parsedContent = parseMarkdown(message.content);
  $: highlightedContent = highlightMentions(parsedContent);
  $: isEdited = !!message.editedAt;

  function highlightMentions(content: string): string {
    // Match @username patterns (alphanumeric, underscore, hyphen)
    return content.replace(/@([a-zA-Z0-9_-]+)/g, '<span class="mention">@$1</span>');
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

  let showReactionPicker = false;
  let showContextMenu = false;
  let showMobileMenu = false;
  let mobileMenuMode: 'actions' | 'reactions' = 'actions';
  let contextMenuX = 0;
  let contextMenuY = 0;
  let pressTimer: ReturnType<typeof setTimeout> | null = null;
  let touchStartX = 0;
  let touchStartY = 0;
  let isEditing = false;
  let editContent = '';
  let longPressFired = false;
  let movedTooMuch = false;
  let customEmojiInput = '';
  let editTextarea: HTMLTextAreaElement | null = null;
  const LONG_PRESS_MS = 650;
  const MOVE_CANCEL_PX = 12;
  
  const QUICK_REACTIONS = [
    { emoji: '👍', name: 'Like' },
    { emoji: '👏', name: 'Cheer' },
    { emoji: '🎉', name: 'Celebrate' },
    { emoji: '✨', name: 'Appreciate' },
    { emoji: '🙂', name: 'Smile' }
  ];
  
  // Map various emoji formats to SVG names
  const emojiToSvgMap: Record<string, string> = {
    '👍': 'thumbs-up',
    'thumbsup': 'thumbs-up',
    '❤️': 'heart',
    '❤': 'heart',
    'heart': 'heart',
    '😂': 'laugh',
    'laugh': 'laugh',
    '🔥': 'fire',
    'fire': 'fire',
    '👀': 'eyes',
    'eyes': 'eyes',
    '💯': 'hundred',
    'hundred': 'hundred',
    '✅': 'check',
    'check': 'check',
    '👎': 'thumbs-down',
    'thumbdown': 'thumbs-down'
  };
  
  function getReactionSvg(name: string): string {
    const svgs: Record<string, string> = {
      'thumbs-up': '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 11H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h3"/></svg>',
      'thumbs-down': '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zM17 13h3a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-3"/></svg>',
      'heart': '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
      'laugh': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>',
      'fire': '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>',
      'eyes': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
      'hundred': '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/><text x="12" y="16" text-anchor="middle" font-size="12" font-weight="bold" fill="white">💯</text></svg>',
      'check': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>'
    };
    return svgs[name] || '';
  }
  
  function getSvgNameForEmoji(emoji: string): string | null {
    return emojiToSvgMap[emoji] || null;
  }

  function closeMenus() {
    showContextMenu = false;
    showReactionPicker = false;
    showMobileMenu = false;
    mobileMenuMode = 'actions';
  }

  function isInteractiveTarget(target: EventTarget | null) {
    return target instanceof HTMLElement && !!target.closest('button, a, input, textarea, select');
  }

  function clearPressTimer() {
    if (pressTimer) {
      clearTimeout(pressTimer);
      pressTimer = null;
    }
  }

  function handlePointerDown(e: PointerEvent) {
    if (e.pointerType === 'mouse') {
      return;
    }

    if (isInteractiveTarget(e.target)) return;

    clearPressTimer();
    longPressFired = false;
    movedTooMuch = false;
    touchStartX = e.clientX;
    touchStartY = e.clientY;

    pressTimer = setTimeout(() => {
      vibrateMedium();
      longPressFired = true;
      showMobileMenu = true;
      mobileMenuMode = 'actions';
    }, LONG_PRESS_MS);
  }

  function handlePointerMove(e: PointerEvent) {
    if (e.pointerType === 'mouse' || !pressTimer || showMobileMenu) {
      return;
    }

    const deltaX = Math.abs(e.clientX - touchStartX);
    const deltaY = Math.abs(e.clientY - touchStartY);

    if (deltaY > MOVE_CANCEL_PX || deltaX > MOVE_CANCEL_PX) {
      clearPressTimer();
      movedTooMuch = true;
    }
  }

  function handlePointerUp(e: PointerEvent) {
    if (e.pointerType === 'mouse') {
      return;
    }

    clearPressTimer();
    longPressFired = false;
  }

  function handleContextMenu(e: MouseEvent) {
    e.preventDefault();

    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return;
    }
    contextMenuX = e.clientX;
    contextMenuY = e.clientY;
    showContextMenu = true;
  }

  async function handleReactionClick(emoji: string) {
    closeMenus();
    customEmojiInput = '';
    if (!$convexChannelStore.selectedChannelId) return;
    
    const reaction = message.reactions?.find((r: any) => r.emoji === emoji);
    const hasReacted = reaction?.users.includes($authStore.user?.username);
    
    if (hasReacted) {
      await messageStore.removeReaction(message.id, emoji, $convexChannelStore.selectedChannelId);
    } else {
      await messageStore.addReaction(message.id, emoji, $convexChannelStore.selectedChannelId);
    }
  }

  async function handleCustomEmoji() {
    const emoji = customEmojiInput.trim();
    if (!emoji) return;
    
    customEmojiInput = '';
    closeMenus();
    
    if (!$convexChannelStore.selectedChannelId) return;
    
    const reaction = message.reactions?.find((r: any) => r.emoji === emoji);
    const hasReacted = reaction?.users.includes($authStore.user?.username);
    
    if (hasReacted) {
      await messageStore.removeReaction(message.id, emoji, $convexChannelStore.selectedChannelId);
    } else {
      await messageStore.addReaction(message.id, emoji, $convexChannelStore.selectedChannelId);
    }
  }

  async function handleDelete() {
    closeMenus();
    if (!$convexChannelStore.selectedChannelId) return;
    await messageStore.deleteMessage(message.id, $convexChannelStore.selectedChannelId);
  }

  async function startEdit() {
    isEditing = true;
    editContent = message.content;
    closeMenus();
    await tick();
    editTextarea?.focus();
    editTextarea?.setSelectionRange(editTextarea.value.length, editTextarea.value.length);
  }

  function cancelEdit() {
    isEditing = false;
    editContent = '';
  }

  async function saveEdit() {
    const next = editContent.trim();
    if (!next) return;
    const result = await messageStore.editMessage(message.id, next);
    if (result.success) {
      isEditing = false;
      editContent = '';
    } else {
      alert(result.error || 'Failed to edit message');
    }
  }
</script>

{#if showReactionPicker}
  <button type="button" class="fixed inset-0 z-40 hidden md:block cursor-default" on:click={() => showReactionPicker = false} aria-label="Close reaction picker"></button>

  <div class="hidden md:block absolute z-50 -top-10 left-12">
    <div class="hover:scale-x-105 transition-all duration-300 *:transition-all *:duration-300 flex justify-start text-xl items-center shadow-xl z-10 bg-[#1a1a1a] gap-1 p-1.5 rounded-full border border-white/10">
      {#each QUICK_REACTIONS as reaction}
        <button
          type="button"
          on:click|stopPropagation={() => handleReactionClick(reaction.emoji)}
          class="relative before:hidden hover:before:flex before:justify-center before:items-center before:h-4 before:text-[.6rem] before:px-1 before:content-['{reaction.name}'] before:bg-black before:text-white before:absolute before:-top-7 before:rounded-lg hover:-translate-y-5 cursor-pointer hover:scale-125 bg-white/10 rounded-full p-1.5 px-2.5 text-white transition-all duration-200"
        >
          {reaction.emoji}
        </button>
      {/each}
    </div>
  </div>
{/if}

{#if showContextMenu}
  <button type="button" class="fixed inset-0 z-40 hidden md:block cursor-default" on:click={() => showContextMenu = false} aria-label="Close message menu"></button>

  <div
    class="hidden md:block fixed z-50 bg-[#222] border border-white/10 rounded-xl shadow-2xl py-1 min-w-[160px] animate-scale-in"
    style="left: {contextMenuX}px; top: {contextMenuY}px;"
  >
    <button
      type="button"
      on:click|stopPropagation={() => handleReactionClick('❤️')}
      class="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10 transition-colors flex items-center gap-2"
    >
      <span class="text-base leading-none">❤️</span>
      Like
    </button>
    {#if onOpenThread}
      <button
        type="button"
        on:click|stopPropagation={() => {
          showContextMenu = false;
          onOpenThread?.(message);
        }}
        class="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10 transition-colors flex items-center gap-2"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        Reply in thread
      </button>
    {/if}
    <button
      type="button"
      on:click|stopPropagation={() => {
        showContextMenu = false;
        showReactionPicker = true;
      }}
      class="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10 transition-colors flex items-center gap-2"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
        <line x1="9" y1="9" x2="9.01" y2="9"/>
        <line x1="15" y1="9" x2="15.01" y2="9"/>
      </svg>
      Add reaction
    </button>
    {#if isOwn}
      <button
        type="button"
        on:click|stopPropagation={startEdit}
        class="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10 transition-colors flex items-center gap-2"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
        Edit
      </button>
      <button
        type="button"
        on:click|stopPropagation={handleDelete}
        class="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-white/10 transition-colors flex items-center gap-2"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
        Delete message
      </button>
    {/if}
  </div>
{/if}

<Drawer.Root open={showMobileMenu} onOpenChange={(open) => { showMobileMenu = open; if (!open) mobileMenuMode = 'actions'; }}>
  <Drawer.Portal>
    <Drawer.Overlay class="fixed inset-0 bg-black/60 z-40 md:hidden" />
    <Drawer.Content class="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-[#222] border-t border-white/10 rounded-t-2xl outline-none" style="padding-bottom: env(safe-area-inset-bottom);">
      <div class="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-white/20 mt-4 mb-6"></div>

      <div class="px-4 pb-6">
        {#if mobileMenuMode === 'actions'}
          <div class="space-y-2">
            <button
              type="button"
              on:click={() => handleReactionClick('❤️')}
              class="w-full px-4 py-3 text-left text-sm text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors flex items-center gap-3"
            >
              {@html getReactionSvg('heart')}
              Like
            </button>
            <button
              type="button"
              on:click={() => { mobileMenuMode = 'reactions'; }}
              class="w-full px-4 py-3 text-left text-sm text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors flex items-center gap-3"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                <line x1="9" y1="9" x2="9.01" y2="9"/>
                <line x1="15" y1="9" x2="15.01" y2="9"/>
              </svg>
              Add reaction
            </button>
            {#if onOpenThread}
              <button
                type="button"
                on:click={() => {
                  closeMenus();
                  onOpenThread?.(message);
                }}
                class="w-full px-4 py-3 text-left text-sm text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors flex items-center gap-3"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                Reply in thread
              </button>
            {/if}
            {#if isOwn}
              <button
                type="button"
                on:click={startEdit}
                class="w-full px-4 py-3 text-left text-sm text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors flex items-center gap-3"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Edit
              </button>
              <button
                type="button"
                on:click={handleDelete}
                class="w-full px-4 py-3 text-left text-sm text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-xl transition-colors flex items-center gap-3"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
                Delete message
              </button>
            {/if}
          </div>
        {:else}
          <div class="flex items-center justify-between mb-4">
            <button type="button" on:click={() => { mobileMenuMode = 'actions'; }} class="text-sm text-white/60 hover:text-white transition-colors">
              Back
            </button>
            <h3 class="text-sm font-semibold text-white">Add Reaction</h3>
            <div class="w-10"></div>
          </div>

          <div class="flex flex-wrap gap-2 mb-4">
            {#each QUICK_REACTIONS as reaction}
              <button
                type="button"
                on:click={() => handleReactionClick(reaction.emoji)}
                class="bg-white/10 rounded-full px-4 py-3 text-2xl text-white transition-transform duration-200 active:scale-95"
                aria-label={reaction.name}
              >
                {reaction.emoji}
              </button>
            {/each}
          </div>

          <div class="flex gap-2">
            <input
              type="text"
              bind:value={customEmojiInput}
              placeholder="Type any emoji..."
              class="flex-1 px-3 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder:text-white/30 outline-none focus:border-white/30"
              on:keydown={(e) => e.key === 'Enter' && handleCustomEmoji()}
            />
            <button
              type="button"
              on:click={handleCustomEmoji}
              disabled={!customEmojiInput.trim()}
              class="px-4 py-3 bg-white text-black rounded-lg font-medium text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/90 transition-all"
            >
              Add
            </button>
          </div>
        {/if}
      </div>
    </Drawer.Content>
  </Drawer.Portal>
</Drawer.Root>
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div 
  class="group message-bubble relative px-4 md:px-5 {showHeader ? 'mt-4 pt-1' : 'mt-0.5'} {(showContextMenu || showReactionPicker || showMobileMenu || isEditing) ? 'bg-white/5' : ''} rounded-xl"
  data-message-id={message.id}
  on:contextmenu={handleContextMenu}
  on:pointerdown={handlePointerDown}
  on:pointermove={handlePointerMove}
  on:pointerup={handlePointerUp}
  on:pointercancel={() => {
    clearPressTimer();
    movedTooMuch = true;
    longPressFired = false;
  }}
  in:fly={{ y: 20, duration: 200 }}
  style="-webkit-user-select: none; user-select: none; -webkit-touch-callout: none; -webkit-tap-highlight-color: transparent;"
>
  <div class="flex gap-3">
    <!-- Avatar -->
    {#if showHeader}
      <Avatar alt={message.author} size="md" status={null} />
    {:else}
      <div class="w-10 shrink-0"></div>
    {/if}

    <div class="flex-1 min-w-0">
      <!-- Header -->
      {#if showHeader}
        <div class="flex items-baseline gap-2 mb-0.5">
          <span class="text-[14px] font-semibold" style="color: {getAvatarColor(message.author)};">
            {message.author}
          </span>
          <span class="text-[11px] text-white/40 font-medium">
            {formatTime(message.createdAt)}
          </span>
        </div>
      {/if}

      <!-- Content -->
      {#if isEditing}
        <div class="mt-1">
          <textarea
            bind:this={editTextarea}
            bind:value={editContent}
            rows="3"
            class="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-white/25 outline-none focus:border-white/30 resize-none transition-colors"
          ></textarea>
          <div class="flex gap-2 mt-2">
            <button
              type="button"
              on:click|stopPropagation={cancelEdit}
              class="flex-1 px-3 py-2 bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10 transition-all duration-200 font-medium text-sm"
            >
              Cancel
            </button>
            <button
              type="button"
              on:click|stopPropagation={saveEdit}
              disabled={!editContent.trim()}
              class="flex-1 px-3 py-2 bg-white text-black rounded-xl hover:bg-white/90 transition-all duration-200 font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save
            </button>
          </div>
        </div>
      {:else}
        <div 
          class="message-content text-[14.5px] text-white/80 leading-relaxed break-words whitespace-pre-wrap"
        >
          {@html highlightedContent}
        </div>
        {#if isEdited}
          <div class="mt-0.5 text-[11px] text-white/30">(edited)</div>
        {/if}
      {/if}

      <!-- Reactions -->
      {#if message.reactions && message.reactions.length > 0}
        <div class="flex flex-wrap gap-1 mt-1.5">
          {#each message.reactions as reaction}
            {@const hasReacted = reaction.users.includes($authStore.user?.username)}
            {@const svgName = getSvgNameForEmoji(reaction.emoji) || reaction.emoji}
            <button
              type="button"
              on:click={() => handleReactionClick(reaction.emoji)}
              class="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs transition-all duration-200 border transform hover:scale-105 active:scale-95 {hasReacted ? 'bg-white/20 border-white/40 text-white' : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'}"
            >
              {#if getReactionSvg(svgName)}
                <span class="inline-flex">{@html getReactionSvg(svgName)}</span>
              {:else}
                <span>{reaction.emoji}</span>
              {/if}
              <span class="font-medium">{reaction.count}</span>
            </button>
          {/each}
        </div>
      {/if}

      <!-- Thread Reply Button -->
      {#if onOpenThread && message.replyCount > 0}
        <button
          type="button"
          on:click={() => onOpenThread && onOpenThread(message)}
          class="flex items-center gap-1.5 mt-1.5 px-2.5 py-1 rounded-lg text-xs text-white/50 hover:text-white hover:bg-white/5 transition-all duration-200"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span class="font-medium">{message.replyCount} {message.replyCount === 1 ? 'reply' : 'replies'}</span>
        </button>
      {/if}
    </div>

    <!-- Action buttons - desktop only -->
    <div class="hidden md:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <!-- Reply in thread button -->
      {#if onOpenThread}
        <button
          type="button"
          on:click={() => onOpenThread && onOpenThread(message)}
          class="p-2 text-white/30 hover:text-white hover:bg-white/5 rounded-lg transition-all"
          aria-label="Reply in thread"
          title="Reply in thread"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </button>
      {/if}

      <!-- Delete button for own messages -->
      {#if isOwn}
        <button
          type="button"
          on:click|stopPropagation={handleDelete}
          class="p-2 text-white/30 hover:text-white hover:bg-white/5 rounded-lg transition-all"
          aria-label="Delete message"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </button>
      {/if}
    </div>
  </div>
</div>

<style>
  :global(.message-content img) {
    -webkit-user-select: none;
    -webkit-touch-callout: none;
    user-select: none;
    pointer-events: auto;
  }

  .message-content {
    -webkit-user-select: text;
    user-select: text;
  }

  button {
    -webkit-tap-highlight-color: transparent;
  }

  @media (hover: none) and (pointer: coarse) {
    .message-bubble,
    .message-bubble * {
      -webkit-user-select: none !important;
      -webkit-touch-callout: none !important;
      user-select: none !important;
    }
  }

  /* @mention highlighting */
  :global(.mention) {
    color: #7289da;
    background: rgba(114, 137, 218, 0.2);
    padding: 0 4px;
    border-radius: 4px;
    font-weight: 500;
  }

  :global(.mention:hover) {
    background: rgba(114, 137, 218, 0.3);
    cursor: pointer;
  }
</style>

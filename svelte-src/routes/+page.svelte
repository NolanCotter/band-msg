<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import MessageArea from '../lib/components/MessageArea.svelte';
  import UserList from '../lib/components/UserList.svelte';
  import ChannelSidebar from '../lib/components/ChannelSidebar.svelte';
  import AuthScreen from '../lib/components/AuthScreen.svelte';
  import { authStore } from '../lib/stores/auth';
  import { channelStore } from '../lib/stores/channels';
  import { messageStore } from '../lib/stores/messages';
  import { memberStore } from '../lib/stores/members';

  let refreshInterval: ReturnType<typeof setInterval> | null = null;

  onMount(async () => {
    // Check if user is authenticated
    await authStore.checkAuth();
    
    if ($authStore.user) {
      // Load initial data
      await channelStore.loadChannels();
      await memberStore.loadMembers();
      
      // Start polling for updates
      refreshInterval = setInterval(async () => {
        if ($channelStore.selectedChannelId) {
          await messageStore.loadMessages($channelStore.selectedChannelId);
        }
        await memberStore.loadMembers();
      }, 2000);
    }
  });

  onDestroy(() => {
    if (refreshInterval) clearTimeout(refreshInterval);
  });
</script>

<svelte:head>
  <title>Band Chat - Discord Clone</title>
</svelte:head>

{#if !$authStore.user}
  <AuthScreen />
{:else}
  <div class="h-screen w-screen flex overflow-hidden bg-[#09090b] text-white antialiased">
    <!-- Channel Sidebar -->
    <ChannelSidebar />
    
    <!-- Message Area -->
    <MessageArea />
    
    <!-- User List -->
    <UserList />
  </div>
{/if}

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    overflow: hidden;
    background: #09090b;
    font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }

  :global(*) {
    -webkit-tap-highlight-color: transparent;
    -webkit-touch-callout: none;
  }

  :global(.scrollbar-hide) {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  :global(.scrollbar-hide::-webkit-scrollbar) {
    display: none;
  }
</style>

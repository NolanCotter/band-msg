<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { browser } from '$app/environment';
  import MessageArea from '../lib/components/MessageArea.svelte';
  import UserList from '../lib/components/UserList.svelte';
  import ChannelSidebar from '../lib/components/ChannelSidebar.svelte';
  import AuthScreen from '../lib/components/AuthScreen.svelte';
  import PWAInstallGuide from '../lib/components/PWAInstallGuide.svelte';
  import UsernameSetup from '../lib/components/UsernameSetup.svelte';
  import PendingSetup from '../lib/components/PendingSetup.svelte';
  import ProfileDrawer from '../lib/components/ProfileDrawer.svelte';
  import { authStore } from '../lib/stores/auth';
  import { convexChannelStore } from '../lib/stores/convexChannels';
  import { convexMessageStore } from '../lib/stores/convexMessages';
  import { memberStore } from '../lib/stores/members';
  import { themeStore } from '../lib/stores/theme';
  import { pusherStore } from '../lib/stores/pusher';
  import { apiPost } from '../lib/utils/api';

  let showProfileDrawer = false;

  let showPWAGuide = false;
  let showUsernameSetup = false;
  let heartbeatInterval: any;
  let approvalPollInterval: any;
  let lastChannelId = '';
  let startupError = '';
  let isRetryingStartup = false;

  // Watch for channel changes ONLY (not store updates)
  $: {
    const channelId = $convexChannelStore.selectedChannelId;
    const shouldLoadSelectedChannel =
      !!channelId &&
      $authStore.user?.status === 'approved' &&
      (
        channelId !== lastChannelId ||
        ($convexMessageStore.messages.length === 0 && !$convexMessageStore.isLoading)
      );

    if (shouldLoadSelectedChannel && channelId) {
      lastChannelId = channelId;
      convexMessageStore.loadMessages(channelId);
      convexMessageStore.subscribeToTyping(channelId);
    } else if (!channelId && lastChannelId) {
      lastChannelId = '';
      convexMessageStore.unsubscribeFromTyping();
      convexMessageStore.clearMessages();
    }
  }

  async function initApp() {
    startupError = '';
    isRetryingStartup = true;

    try {
      // Connect to Pusher for real-time updates
      pusherStore.connect();

      // Load initial data from Convex
      await Promise.allSettled([
        convexChannelStore.loadChannels(),
        memberStore.loadMembers()
      ]);

      // Start heartbeat to keep user online
      if (browser && !heartbeatInterval) {
        heartbeatInterval = setInterval(async () => {
          try {
            await apiPost('/api/presence', { status: 'online' });
          } catch (error) {
            console.error('[Page] Heartbeat failed:', error);
          }
        }, 30000);
      }

      // Start polling for member status updates
      memberStore.startPolling();
    } catch (error) {
      console.error('[Page] initApp failed:', error);
      startupError = 'We hit a startup issue while loading your channels. Retry to reconnect.';
    } finally {
      isRetryingStartup = false;
    }
  }

  function startApprovalPolling() {
    if (approvalPollInterval) return;
    approvalPollInterval = setInterval(async () => {
      await authStore.checkAuth();
      if ($authStore.user?.status === 'approved') {
        stopApprovalPolling();
        await initApp();
      }
    }, 3000);
  }

  function stopApprovalPolling() {
    if (approvalPollInterval) {
      clearInterval(approvalPollInterval);
      approvalPollInterval = null;
    }
  }

  onMount(async () => {
    // Initialize theme first
    themeStore.init();

    // Check if user is authenticated
    await authStore.checkAuth();

    // Only show PWA guide if user is NOT logged in (first time visitor)
    if (!$authStore.user && browser) {
      const hasSeenPWAGuide = localStorage.getItem('hasSeenPWAGuide');
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                          (window.navigator as any).standalone === true;

      if (!hasSeenPWAGuide && !isStandalone) {
        showPWAGuide = true;
        return;
      }
    }

    // Only init app if user is approved
    if ($authStore.user && $authStore.user.status === 'approved') {
      await initApp();
    }
    // Pending users see PendingSetup component in template
  });

  onDestroy(() => {
    pusherStore.disconnect();
    stopApprovalPolling();
    memberStore.stopPolling();
    convexChannelStore.cleanup();
    convexMessageStore.cleanup();
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
    }
  });

  function handlePWAGuideComplete() {
    if (browser) {
      localStorage.setItem('hasSeenPWAGuide', 'true');
    }
    showPWAGuide = false;
    // Now check auth
    authStore.checkAuth();
  }

  async function handleUsernameSetupComplete() {
    showUsernameSetup = false;
    // Reload user data
    await authStore.checkAuth();

    if ($authStore.user?.status === 'approved') {
      await initApp();
    }
  }

  async function retryStartup() {
    await authStore.checkAuth();
    if ($authStore.user?.status === 'approved') {
      await initApp();
    }
  }
</script>

<svelte:head>
  <title>Band Chat - Discord Clone</title>
</svelte:head>

{#if showPWAGuide}
  <PWAInstallGuide on:skip={handlePWAGuideComplete} on:done={handlePWAGuideComplete} />
{:else if showUsernameSetup && $authStore.user?.status === 'approved'}
  <UsernameSetup
    suggestedUsername={$authStore.user?.username || ''}
    on:complete={handleUsernameSetupComplete}
  />
{:else if !$authStore.user}
  <AuthScreen />
{:else if $authStore.user?.status === 'pending'}
  <PendingSetup />
{:else}
  {#if startupError}
    <div class="fixed top-4 left-1/2 z-[120] w-[min(92vw,34rem)] -translate-x-1/2 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100 shadow-2xl backdrop-blur-xl">
      <div class="flex items-center justify-between gap-3">
        <p>{startupError}</p>
        <button
          type="button"
          on:click={retryStartup}
          disabled={isRetryingStartup}
          class="shrink-0 rounded-xl bg-white px-3 py-1.5 text-xs font-semibold text-black transition-colors hover:bg-white/90 disabled:opacity-60"
        >
          {isRetryingStartup ? 'Retrying...' : 'Retry'}
        </button>
      </div>
    </div>
  {/if}

  <div class="app-shell flex overflow-hidden bg-black text-white antialiased">
    <!-- Channel Sidebar -->
    <ChannelSidebar />

    <!-- Message Area -->
    <MessageArea />

    <!-- User List -->
    <UserList on:selectUser={(e) => { if (e.detail.isOwnProfile) showProfileDrawer = true; }} />
  </div>

  <!-- Profile Drawer -->
  <ProfileDrawer
    open={showProfileDrawer}
    onClose={() => showProfileDrawer = false}
  />
{/if}

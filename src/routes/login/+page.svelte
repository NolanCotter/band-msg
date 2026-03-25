<script lang="ts">
  import { fade, fly } from 'svelte/transition';

  function handleGoogleSignIn() {
    window.location.href = '/api/auth/google';
  }
</script>

<svelte:head>
  <title>Sign In - Band Chat</title>
</svelte:head>

<div class="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-black via-[#0a0a0a] to-black px-6">
  <div class="absolute inset-0 overflow-hidden pointer-events-none">
    <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse"></div>
    <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse" style="animation-delay: 1s;"></div>
  </div>

  <div class="w-full max-w-md relative z-10" in:fly={{ y: 20, duration: 400 }}>
    <div class="flex justify-center mb-10">
      <div class="relative group">
        <div class="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
        <div class="relative w-20 h-20 rounded-2xl bg-white flex items-center justify-center shadow-2xl">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>
      </div>
    </div>

    <div class="relative group">
      <div class="absolute -inset-0.5 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <div class="relative bg-[#111] border border-white/10 rounded-2xl p-10 shadow-2xl">
        <div in:fade={{ duration: 300, delay: 100 }}>
          <h1 class="text-3xl font-bold text-white mb-3 text-center tracking-tight">
            Band Chat
          </h1>
          <p class="text-white/50 text-center mb-10">
            Sign in with your Google account
          </p>
        </div>

        <button
          type="button"
          on:click={handleGoogleSignIn}
          class="google-btn w-full flex items-center justify-center gap-4 py-4 px-6 rounded-xl font-semibold text-base transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
          in:fade={{ duration: 300, delay: 200 }}
        >
          <svg viewBox="0 0 24 24" width="22" height="22" class="flex-shrink-0">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span>Continue with Google</span>
        </button>
      </div>
    </div>

    <p class="text-center text-white/30 text-xs mt-8">
      built by <a href="https://github.com/NolanCotter" target="_blank" rel="noopener noreferrer" class="text-purple-400 hover:text-purple-300 underline underline-offset-2 transition-colors">nolan</a>
    </p>
  </div>
</div>

<style>
  .google-btn {
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
    color: white;
    backdrop-filter: blur(10px);
  }

  .google-btn:hover {
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.25);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  }

  .google-btn:active {
    transform: translateY(0);
    background: rgba(255, 255, 255, 0.08);
  }
</style>

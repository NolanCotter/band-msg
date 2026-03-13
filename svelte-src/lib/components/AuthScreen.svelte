<script lang="ts">
  import { authStore } from '../stores/auth';

  let mode: 'login' | 'register' = 'login';
  let username = '';
  let password = '';
  let error = '';

  async function handleSubmit() {
    error = '';
    
    if (!username || !password) {
      error = 'Please fill in all fields';
      return;
    }

    if (mode === 'register' && password.length < 12) {
      error = 'Password must be at least 12 characters';
      return;
    }

    const result = mode === 'login'
      ? await authStore.login(username, password)
      : await authStore.register(username, password);

    if (!result.success) {
      error = result.error || 'An error occurred';
    } else if (mode === 'register') {
      error = '';
      mode = 'login';
      password = '';
    }
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  }
</script>

<div class="fixed inset-0 flex items-center justify-center bg-[#09090b] px-6">
  <div class="w-full max-w-md">
    <!-- Logo -->
    <div class="flex justify-center mb-8">
      <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-amber-600 flex items-center justify-center shadow-2xl shadow-orange-500/20">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
      </div>
    </div>

    <!-- Card -->
    <div class="bg-[#111113] border border-white/[0.08] rounded-2xl p-8 shadow-2xl">
      <h1 class="text-2xl font-bold text-white mb-2 text-center">
        {mode === 'login' ? 'Welcome back' : 'Create account'}
      </h1>
      <p class="text-white/40 text-center mb-6">
        {mode === 'login' ? 'Sign in to your band chat' : 'Join your band chat'}
      </p>

      {#if error}
        <div class="mb-4 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
          {error}
        </div>
      {/if}

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-white/60 mb-2">Username</label>
          <input
            type="text"
            bind:value={username}
            on:keydown={handleKeyDown}
            placeholder="Enter your username"
            class="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder:text-white/20 outline-none focus:border-orange-500/30 focus:bg-white/[0.06] transition-all"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-white/60 mb-2">Password</label>
          <input
            type="password"
            bind:value={password}
            on:keydown={handleKeyDown}
            placeholder="Enter your password"
            class="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder:text-white/20 outline-none focus:border-orange-500/30 focus:bg-white/[0.06] transition-all"
          />
          {#if mode === 'register'}
            <p class="text-xs text-white/30 mt-2">Minimum 12 characters</p>
          {/if}
        </div>

        <button
          on:click={handleSubmit}
          disabled={$authStore.isLoading}
          class="w-full py-3 bg-gradient-to-r from-orange-400 to-amber-600 text-white font-semibold rounded-xl hover:from-orange-500 hover:to-amber-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {$authStore.isLoading ? 'Loading...' : mode === 'login' ? 'Sign in' : 'Create account'}
        </button>
      </div>

      <div class="mt-6 text-center">
        <button
          on:click={() => { mode = mode === 'login' ? 'register' : 'login'; error = ''; }}
          class="text-sm text-white/40 hover:text-white/60 transition-colors"
        >
          {mode === 'login' ? 'Need an account? Register' : 'Already have an account? Sign in'}
        </button>
      </div>
    </div>

    <p class="text-center text-white/20 text-xs mt-6">
      Band Chat - Discord Clone
    </p>
  </div>
</div>

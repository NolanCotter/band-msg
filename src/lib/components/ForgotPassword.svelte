<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Spinner from './Spinner.svelte';

  const dispatch = createEventDispatcher();

  let identifier = '';
  let isLoading = false;
  let error = '';
  let success = false;
  let resetLink = '';
  let copied = false;

  async function handleSubmit() {
    if (!identifier.trim()) {
      error = 'Please enter your username';
      return;
    }

    isLoading = true;
    error = '';

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier })
      });

      const data = await response.json();

      if (!response.ok) {
        error = data.error || 'Failed to start password reset';
        return;
      }

      success = true;
      resetLink = typeof data.resetLink === 'string' ? data.resetLink : '';
      copied = false;
    } catch (err) {
      error = 'Network error. Please try again.';
    } finally {
      isLoading = false;
    }
  }

  function handleBack() {
    dispatch('back');
  }

  async function copyResetLink() {
    if (!resetLink) return;

    try {
      await navigator.clipboard.writeText(resetLink);
      copied = true;
      setTimeout(() => {
        copied = false;
      }, 1800);
    } catch {
      copied = false;
    }
  }
</script>

<div class="min-h-screen flex items-center justify-center p-4 bg-black">
  <div class="w-full max-w-md">
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold text-white mb-2">Reset Password</h1>
      <p class="text-white/50 text-sm">
        {success ? 'Use your reset link to choose a new password' : 'Enter your username to generate a password reset link'}
      </p>
    </div>

    {#if success}
      <div class="bg-white/5 border border-white/10 rounded-xl p-6 mb-4">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-green-400">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h3 class="text-white font-semibold">Password Reset Sent!</h3>
        </div>
        <p class="text-white/60 text-sm leading-relaxed mb-4">
          If an account exists for <span class="text-white font-medium">{identifier}</span>, the reset flow is ready.
        </p>
        {#if resetLink}
          <div class="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 space-y-2">
            <p class="text-blue-300 text-xs">
              Local build: use this reset link directly.
            </p>
            <a
              href={resetLink}
              class="block break-all text-xs text-blue-200 underline underline-offset-2 hover:text-blue-100"
            >
              {resetLink}
            </a>
            <div class="flex flex-col gap-2 pt-1 sm:flex-row">
              <a
                href={resetLink}
                class="inline-flex items-center justify-center rounded-lg bg-white px-3 py-2 text-xs font-semibold text-black transition-colors hover:bg-white/90"
              >
                Open reset page
              </a>
              <button
                type="button"
                on:click={copyResetLink}
                class="inline-flex items-center justify-center rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-white/10"
              >
                {copied ? 'Copied' : 'Copy link'}
              </button>
            </div>
          </div>
        {:else}
          <div class="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
            <p class="text-blue-400 text-xs">
              A reset link has been prepared. If email delivery is configured later, this flow can send it automatically.
            </p>
          </div>
        {/if}
      </div>

      <button
        type="button"
        on:click={handleBack}
        class="w-full px-4 py-3 bg-white/10 border border-white/20 text-white rounded-xl hover:bg-white/20 transition-all duration-200 font-semibold hover:scale-[1.02] active:scale-98"
      >
        Back to Login
      </button>
    {:else}
      <form on:submit|preventDefault={handleSubmit} class="space-y-4">
        {#if error}
          <div class="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        {/if}

        <div>
          <label for="identifier" class="block text-sm font-medium text-white/70 mb-2">Username</label>
          <input
            id="identifier"
            type="text"
            bind:value={identifier}
            disabled={isLoading}
            placeholder="your_username"
            class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 outline-none focus:border-white/30 transition-colors disabled:opacity-50"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !identifier.trim()}
          class="w-full px-4 py-3 bg-white/10 border border-white/20 text-white rounded-xl hover:bg-white/20 transition-all duration-200 font-semibold hover:scale-[1.02] active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
        >
          {#if isLoading}
            <Spinner size="sm" />
            <span>Preparing...</span>
          {:else}
            Get Reset Link
          {/if}
        </button>

        <button
          type="button"
          on:click={handleBack}
          disabled={isLoading}
          class="w-full px-4 py-3 bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10 transition-all duration-200 font-medium disabled:opacity-50"
        >
          Back to Login
        </button>
      </form>
    {/if}
  </div>
</div>

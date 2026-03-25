<script lang="ts">
  import { page } from '$app/state';

  let password = '';
  let confirmPassword = '';
  let isLoading = false;
  let error = '';
  let success = false;

  const token = page.url.searchParams.get('token') ?? '';

  async function handleSubmit() {
    error = '';

    if (!token) {
      error = 'This reset link is missing its token.';
      return;
    }

    if (!password || !confirmPassword) {
      error = 'Please fill in both password fields.';
      return;
    }

    if (password !== confirmPassword) {
      error = 'Passwords do not match.';
      return;
    }

    if (password.length < 12) {
      error = 'Password must be at least 12 characters.';
      return;
    }

    isLoading = true;

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        error = typeof data.error === 'string' ? data.error : 'Failed to reset password.';
        return;
      }

      success = true;
      password = '';
      confirmPassword = '';
    } catch (err) {
      error = 'Network error. Please try again.';
    } finally {
      isLoading = false;
    }
  }
</script>

<svelte:head>
  <title>Reset Password</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-black px-6 py-12">
  <div class="w-full max-w-md rounded-2xl border border-white/10 bg-[#111] p-8 shadow-2xl">
    <h1 class="text-2xl font-bold text-white text-center">Choose a new password</h1>
    <p class="mt-2 text-center text-sm text-white/45">
      Set a new password for your Band Chat account.
    </p>

    {#if success}
      <div class="mt-6 rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-200">
        Password updated. You can now <a href="/" class="underline underline-offset-2">go back and sign in</a>.
      </div>
    {:else}
      <form class="mt-6 space-y-4" on:submit|preventDefault={handleSubmit}>
        {#if error}
          <div class="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        {/if}

        <div>
          <label for="new-password" class="mb-2 block text-sm font-medium text-white/70">New password</label>
          <input
            id="new-password"
            type="password"
            bind:value={password}
            class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition-colors focus:border-white/25"
            placeholder="At least 12 characters"
            autocomplete="new-password"
          />
        </div>

        <div>
          <label for="confirm-password" class="mb-2 block text-sm font-medium text-white/70">Confirm password</label>
          <input
            id="confirm-password"
            type="password"
            bind:value={confirmPassword}
            class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition-colors focus:border-white/25"
            placeholder="Repeat your new password"
            autocomplete="new-password"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          class="w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black transition-all duration-200 hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? 'Saving...' : 'Reset password'}
        </button>
      </form>
    {/if}
  </div>
</div>

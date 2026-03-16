<script lang="ts">
  import { onMount } from 'svelte';
  import { convex } from '../../lib/convex';
  import { api } from '../../../convex/_generated/api';
  import { convexMessageStore } from '../../lib/stores/convexMessages';

  let sessionToken = '';
  let allUsers: any[] = [];
  let allRequests: any[] = [];
  let usernameToApprove = '';
  let result = '';
  let error = '';

  onMount(() => {
    convexMessageStore.subscribe(state => {
      sessionToken = state.sessionToken;
    });
  });

  async function loadData() {
    if (!sessionToken) {
      error = 'No session token';
      return;
    }

    try {
      error = '';
      const users = await convex.query(api.debug.getAllUsersDebug, { sessionToken });
      const requests = await convex.query(api.debug.getAllSignupRequestsDebug, { sessionToken });
      allUsers = users;
      allRequests = requests;
    } catch (err: any) {
      error = err.message || String(err);
    }
  }

  async function forceApprove() {
    if (!sessionToken || !usernameToApprove) {
      error = 'Need session token and username';
      return;
    }

    try {
      error = '';
      result = '';
      const res = await convex.mutation(api.debug.forceApproveUser, {
        sessionToken,
        username: usernameToApprove,
      });
      result = JSON.stringify(res, null, 2);
      await loadData();
    } catch (err: any) {
      error = err.message || String(err);
    }
  }
</script>

<div class="p-8 bg-black text-white min-h-screen">
  <h1 class="text-2xl font-bold mb-4">Debug Approval System</h1>

  <div class="mb-4">
    <p class="mb-2">Session Token: {sessionToken ? '✓ Present' : '✗ Missing'}</p>
    <button
      on:click={loadData}
      class="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
    >
      Load Data
    </button>
  </div>

  {#if error}
    <div class="mb-4 p-4 bg-red-900 rounded">
      <strong>Error:</strong> {error}
    </div>
  {/if}

  {#if result}
    <div class="mb-4 p-4 bg-green-900 rounded">
      <strong>Result:</strong>
      <pre>{result}</pre>
    </div>
  {/if}

  <div class="mb-8">
    <h2 class="text-xl font-bold mb-2">Force Approve User</h2>
    <input
      type="text"
      bind:value={usernameToApprove}
      placeholder="Enter username"
      class="px-4 py-2 bg-gray-800 rounded mr-2"
    />
    <button
      on:click={forceApprove}
      class="px-4 py-2 bg-green-600 rounded hover:bg-green-700"
    >
      Force Approve
    </button>
  </div>

  <div class="grid grid-cols-2 gap-4">
    <div>
      <h2 class="text-xl font-bold mb-2">All Users</h2>
      <div class="bg-gray-900 p-4 rounded overflow-auto max-h-96">
        <pre class="text-xs">{JSON.stringify(allUsers, null, 2)}</pre>
      </div>
    </div>

    <div>
      <h2 class="text-xl font-bold mb-2">All Signup Requests</h2>
      <div class="bg-gray-900 p-4 rounded overflow-auto max-h-96">
        <pre class="text-xs">{JSON.stringify(allRequests, null, 2)}</pre>
      </div>
    </div>
  </div>
</div>

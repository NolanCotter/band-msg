<script lang="ts">
  import { onMount } from 'svelte';
  import { apiGet, apiPost } from '../utils/api';

  export let onClose: () => void;

  type Event = {
    id: string;
    title: string;
    description: string;
    location: string;
    startsAt: number;
    endsAt: number;
    createdBy: string;
  };

  let events: Event[] = [];
  let isLoading = false;
  let showCreateForm = false;
  
  let newEventTitle = '';
  let newEventDescription = '';
  let newEventLocation = '';
  let newEventStartsAt = '';
  let newEventEndsAt = '';

  onMount(async () => {
    await loadEvents();
  });

  async function loadEvents() {
    isLoading = true;
    try {
      const res = await apiGet('/api/events');
      if (res.ok) {
        events = await res.json();
      }
    } finally {
      isLoading = false;
    }
  }

  async function createEvent() {
    if (!newEventTitle || !newEventStartsAt || !newEventEndsAt) return;

    const res = await apiPost('/api/events', {
      title: newEventTitle,
      description: newEventDescription,
      location: newEventLocation,
      startsAt: new Date(newEventStartsAt).getTime(),
      endsAt: new Date(newEventEndsAt).getTime(),
    });

    if (res.ok) {
      newEventTitle = '';
      newEventDescription = '';
      newEventLocation = '';
      newEventStartsAt = '';
      newEventEndsAt = '';
      showCreateForm = false;
      await loadEvents();
    }
  }

  function formatEventTime(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
</script>

<div class="fixed inset-0 bg-black/80 flex items-center justify-center z-[200] p-4" style="padding-top: env(safe-area-inset-top); padding-bottom: env(safe-area-inset-bottom);">
  <div class="bg-[#111] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
    <!-- Header -->
    <div class="flex items-center justify-between p-4 border-b border-white/10">
      <h2 class="text-xl font-bold text-white">Calendar & Events</h2>
      <div class="flex items-center gap-2">
        <button
          type="button"
          on:click={() => showCreateForm = !showCreateForm}
          class="px-4 py-2 bg-white text-black rounded-lg hover:bg-white/90 transition-colors text-sm font-medium"
        >
          {showCreateForm ? 'Cancel' : 'New Event'}
        </button>
        <button
          type="button"
          on:click={onClose}
          class="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto p-4">
      {#if showCreateForm}
        <div class="bg-white/5 border border-white/10 rounded-lg p-4 mb-4">
          <h3 class="text-lg font-semibold text-white mb-4">Create Event</h3>
          <div class="space-y-3">
            <div>
              <label class="block text-sm font-medium text-white/60 mb-1">Title</label>
              <input
                type="text"
                bind:value={newEventTitle}
                placeholder="Event title"
                class="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/20 outline-none focus:border-white/30"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-white/60 mb-1">Description</label>
              <textarea
                bind:value={newEventDescription}
                placeholder="Event description"
                rows="3"
                class="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/20 outline-none focus:border-white/30 resize-none"
              ></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-white/60 mb-1">Location</label>
              <input
                type="text"
                bind:value={newEventLocation}
                placeholder="Event location"
                class="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/20 outline-none focus:border-white/30"
              />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-sm font-medium text-white/60 mb-1">Starts At</label>
                <input
                  type="datetime-local"
                  bind:value={newEventStartsAt}
                  class="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white outline-none focus:border-white/30"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-white/60 mb-1">Ends At</label>
                <input
                  type="datetime-local"
                  bind:value={newEventEndsAt}
                  class="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white outline-none focus:border-white/30"
                />
              </div>
            </div>
            <button
              type="button"
              on:click={createEvent}
              class="w-full px-4 py-2 bg-white text-black rounded-lg hover:bg-white/90 transition-colors font-medium"
            >
              Create Event
            </button>
          </div>
        </div>
      {/if}

      {#if isLoading}
        <div class="text-center py-8 text-white/40">Loading events...</div>
      {:else if events.length === 0}
        <div class="text-center py-8 text-white/40">
          No events scheduled. Create one to get started!
        </div>
      {:else}
        <div class="space-y-2">
          {#each events as event}
            <div class="bg-white/5 border border-white/10 rounded-lg p-4">
              <h3 class="font-semibold text-white mb-1">{event.title}</h3>
              {#if event.description}
                <p class="text-sm text-white/60 mb-2">{event.description}</p>
              {/if}
              <div class="flex flex-wrap gap-3 text-sm text-white/40">
                <div class="flex items-center gap-1">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  {formatEventTime(event.startsAt)}
                </div>
                {#if event.location}
                  <div class="flex items-center gap-1">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    {event.location}
                  </div>
                {/if}
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>
</div>

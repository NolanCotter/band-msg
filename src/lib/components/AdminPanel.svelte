<script lang="ts">
  import { Drawer } from 'vaul-svelte';
  import { fade } from 'svelte/transition';

  export let onClose: () => void;
</script>

<Drawer.Root open={true} onOpenChange={(open) => { if (!open) onClose(); }}>
  <Drawer.Portal>
    <Drawer.Overlay class="fixed inset-0 bg-black/80 z-[200]" transition={fade} transitionConfig={{ duration: 150 }} />
    <Drawer.Content class="fixed bottom-0 left-0 right-0 md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:bottom-auto md:right-auto z-[200] flex flex-col bg-black rounded-t-[20px] md:rounded-2xl max-h-[75vh] md:max-h-[85vh] md:w-full md:max-w-xl outline-none" style="padding-bottom: env(safe-area-inset-bottom);">
      <div class="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-white/10 my-3 md:hidden"></div>

      <div class="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0 md:px-6 md:py-4">
        <h2 class="text-lg font-bold text-white md:text-xl">Admin Tools Locked</h2>
        <button
          type="button"
          on:click={onClose}
          class="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors"
          aria-label="Close"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div class="flex-1 overflow-y-auto p-4 md:p-6">
        <div class="rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
          <p class="text-sm font-semibold text-red-100">Temporary security lock-down</p>
          <p class="mt-2 text-sm leading-relaxed text-red-50/80">
            Admin controls are temporarily disabled while the browser-token admin path is removed.
            This prevents account, role, and deletion actions from being executed from a stolen client session.
          </p>
        </div>

        <div class="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/70">
          Use the cookie-backed server routes directly for any emergency maintenance until the hardened admin UI is rebuilt.
        </div>
      </div>
    </Drawer.Content>
  </Drawer.Portal>
</Drawer.Root>

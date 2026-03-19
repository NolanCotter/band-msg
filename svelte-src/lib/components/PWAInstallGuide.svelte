<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  
  const dispatch = createEventDispatcher();
  
  function skip() {
    dispatch('skip');
  }
  
  function done() {
    dispatch('done');
  }
</script>

<div class="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-black via-[#0a0a0a] to-black px-6 overflow-y-auto py-8">
  <div class="absolute inset-0 overflow-hidden pointer-events-none">
    <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse-subtle"></div>
    <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse-subtle" style="animation-delay: 1s;"></div>
  </div>

  <div class="w-full max-w-md relative z-10">
    <div class="relative group">
      <div class="absolute -inset-0.5 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <div class="relative bg-[#111] border border-white/10 rounded-2xl p-6 shadow-2xl backdrop-blur-xl animate-scale-in">
        <div class="text-center mb-6">
          <div class="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-white/10 mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-white mb-2">Add to Home Screen</h2>
          <p class="text-white/60 text-sm">Install Band Chat for quick access</p>
        </div>

        <!-- Android -->
        <div class="mb-6">
          <h3 class="text-sm font-semibold text-white/80 uppercase tracking-wider mb-3 flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.6 9.48l1.84-3.18c.16-.31.04-.69-.26-.85a.637.637 0 0 0-.83.22l-1.88 3.24a11.43 11.43 0 0 0-8.94 0L5.65 5.67a.643.643 0 0 0-.87-.2c-.28.18-.37.54-.22.83L6.4 9.48A10.81 10.81 0 0 0 1 18h22a10.81 10.81 0 0 0-5.4-8.52z"/>
            </svg>
            Android (Chrome)
          </h3>
          <ol class="space-y-2 text-sm text-white/70">
            <li class="flex items-start gap-2">
              <span class="flex-shrink-0 w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-xs mt-0.5">1</span>
              <span>Tap the <strong class="text-white">menu (⋮)</strong> in top right</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="flex-shrink-0 w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-xs mt-0.5">2</span>
              <span>Select <strong class="text-white">"Add to Home screen"</strong></span>
            </li>
            <li class="flex items-start gap-2">
              <span class="flex-shrink-0 w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-xs mt-0.5">3</span>
              <span>Tap <strong class="text-white">"Add"</strong></span>
            </li>
          </ol>
        </div>

        <!-- iOS -->
        <div class="mb-6">
          <h3 class="text-sm font-semibold text-white/80 uppercase tracking-wider mb-3 flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09z"/>
            </svg>
            iPhone / iPad
          </h3>
          <ol class="space-y-2 text-sm text-white/70">
            <li class="flex items-start gap-2">
              <span class="flex-shrink-0 w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-xs mt-0.5">1</span>
              <span>Tap the <strong class="text-white">share icon</strong> (square with arrow)</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="flex-shrink-0 w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-xs mt-0.5">2</span>
              <span>Scroll down, tap <strong class="text-white">"Add to Home Screen"</strong></span>
            </li>
            <li class="flex items-start gap-2">
              <span class="flex-shrink-0 w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-xs mt-0.5">3</span>
              <span>Tap <strong class="text-white">"Add"</strong> in top right</span>
            </li>
          </ol>
        </div>

        <button
          on:click={done}
          class="w-full py-3 bg-white text-black font-semibold rounded-xl hover:bg-white/90 transition-colors"
        >
          Got it!
        </button>
        
        <button
          on:click={skip}
          class="w-full py-2 text-white/40 hover:text-white/80 transition-all text-sm mt-2"
        >
          Skip
        </button>
      </div>
    </div>
  </div>
</div>

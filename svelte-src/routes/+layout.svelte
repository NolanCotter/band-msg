<slot />

<style>
  :global(:root) {
    /* Apple dark-mode system palette */
    --bg-0: #000000;           /* OLED black — body / main */
    --bg-1: #111111;           /* primary surface — sidebar */
    --bg-2: #1c1c1e;           /* raised surface — inputs, popovers */
    --bg-3: #2c2c2e;           /* even more raised — hover states */
    --separator: rgba(84, 84, 88, 0.55);
    --fill: rgba(120, 120, 128, 0.18);

    /* Monochrome text */
    --text-primary: #ffffff;
    --text-secondary: rgba(235, 235, 245, 0.72);
    --text-tertiary: rgba(235, 235, 245, 0.38);
    --text-placeholder: rgba(235, 235, 245, 0.28);

    /* Semantic accent — only used for notifications */
    --color-error: #ff453a;
    --color-success: #30d158;

    /* Active/selection tint — white-based, stays monochrome */
    --tint: rgba(255, 255, 255, 0.10);
    --tint-strong: rgba(255, 255, 255, 0.16);

    --radius-sm: 8px;
    --radius-md: 12px;
    --radius-lg: 16px;
  }

  :global(body) {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display",
      system-ui, sans-serif;
    background: var(--bg-0);
    color: var(--text-secondary);
    min-height: 100vh;
    line-height: 1.4;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  :global(*) { box-sizing: border-box; }

  :global(button), :global(input), :global(textarea) { font: inherit; }

  :global(::-webkit-scrollbar) { width: 6px; }
  :global(::-webkit-scrollbar-track) { background: transparent; }
  :global(::-webkit-scrollbar-thumb) {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 999px;
  }
  :global(::-webkit-scrollbar-thumb:hover) {
    background: rgba(255, 255, 255, 0.18);
  }
</style>

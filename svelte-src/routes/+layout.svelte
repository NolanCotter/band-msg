<slot />

<style>
  :global(html) {
    height: 100%;
    overflow-x: hidden;
    overflow-y: auto;
  }

  :global(body) {
    margin: 0;
    font-family: Inter, system-ui, -apple-system, sans-serif;
    background: #313338;
    color: #dbdee1;
    min-height: 100vh;
    line-height: 1.5;
    overflow-x: hidden;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }

  :global(*) {
    box-sizing: border-box;
  }

  :global(button),
  :global(input) {
    font: inherit;
  }
</style>

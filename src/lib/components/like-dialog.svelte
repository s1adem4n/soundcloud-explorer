<script lang="ts">
  import type { Like } from '@/lib/likes';

  let {
    like,
    open = $bindable(),
    showInListVisible = false,
    onShowInList,
  }: {
    like: Like;
    open: boolean;
    showInListVisible?: boolean;
    onShowInList: () => unknown;
  } = $props();

  let dialogElement: HTMLDialogElement;
  let copied = $state(false);

  $effect(() => {
    if (open) {
      dialogElement.showModal();
    } else {
      dialogElement.close();
    }
  });
</script>

<dialog
  bind:this={dialogElement}
  onclick={(e) => {
    if (e.target === dialogElement) open = false;
  }}
  class="m-auto hidden min-w-xs flex-col divide-y divide-black border border-black bg-white text-center open:flex"
>
  {#if showInListVisible}
    <button onclick={onShowInList} class="px-4 py-2">Show in list</button>
  {/if}

  <a
    href="soundcloud://users:{like.track.user.id}"
    target="_blank"
    class="px-4 py-2"
  >
    Open user page
  </a>

  <button
    class="px-4 py-2"
    onclick={async () => {
      await navigator.clipboard.writeText(like.track.permalink_url);
      copied = true;
      setTimeout(() => {
        copied = false;
      }, 500);
    }}
  >
    {#if copied}
      Copied link
    {:else}
      Copy link
    {/if}
  </button>
</dialog>

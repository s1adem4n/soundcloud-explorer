<script lang="ts">
  import { tick } from 'svelte';
  import { VList, type VListHandle } from 'virtua/svelte';

  import LikeDialog from '@/lib/components/like-dialog.svelte';
  import ListLike from '@/lib/components/list-like.svelte';
  import type { Like } from '@/lib/likes';
  import { createFuse } from '@/lib/search';
  import { normalizeText } from '@/lib/utils';

  let { likes, query = $bindable() }: { likes: Like[]; query: string } =
    $props();

  const fuse = $derived(createFuse(likes));

  const filteredLikes = $derived(
    query.trim()
      ? fuse
          .search(normalizeText(query.trim()))
          .map((result) => result.item.original)
      : likes,
  );

  let selectedLike: Like | null = $state(null);
  let detailsOpen = $state(false);

  let currentMonthYear = $state('');
  let isScrolling = $state(false);
  let list: VListHandle | undefined = $state();

  const monthYears = $derived(
    filteredLikes.map((like) =>
      new Date(like.created_at).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      }),
    ),
  );

  function updateCurrentLike(offset: number) {
    const index = list?.findItemIndex(offset) ?? 0;
    const monthYear = monthYears[index] ?? '';
    if (monthYear !== currentMonthYear) {
      currentMonthYear = monthYear;
    }
  }

  function updateScrollState(offset: number) {
    updateCurrentLike(offset);
    if (!isScrolling) isScrolling = true;
  }

  async function showInList(like: Like) {
    const index = likes.findIndex((item) => item.track.id === like.track.id);
    if (index === -1) return;

    detailsOpen = false;
    query = '';

    await tick();
    list?.scrollToIndex(index, { align: 'center' });
  }
</script>

<div class="relative min-h-0 flex-1">
  {#if isScrolling && currentMonthYear}
    <div
      class="pointer-events-none absolute top-4 left-1/2 z-10 -translate-x-1/2 rounded bg-black/70 px-2 py-1 text-sm whitespace-nowrap text-white"
    >
      {currentMonthYear}
    </div>
  {/if}

  <VList
    bind:this={list}
    class="h-full py-2"
    data={filteredLikes}
    getKey={(like) => like.track.id}
    onscroll={updateScrollState}
    onscrollend={() => {
      isScrolling = false;
    }}
  >
    {#snippet children(like)}
      <ListLike
        {like}
        onShowDetails={() => {
          selectedLike = like;
          detailsOpen = true;
        }}
      />
    {/snippet}
  </VList>
</div>

{#if selectedLike}
  <LikeDialog
    like={selectedLike}
    bind:open={detailsOpen}
    showInListVisible={!!query.trim()}
    onShowInList={() => showInList(selectedLike!)}
  />
{/if}

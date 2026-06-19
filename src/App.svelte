<script lang="ts">
  import List from '@/lib/components/list.svelte';
  import { loadLikes } from '@/lib/likes';

  const likes = await loadLikes();
  const reversedLikes = likes.likes.toReversed();

  let query = $state('');
</script>

<div class="relative flex h-full flex-col">
  <input
    class="h-10 w-full px-4 shadow-sm focus:outline-none"
    placeholder="search ..."
    bind:value={query}
  />

  <List likes={reversedLikes} bind:query />
</div>

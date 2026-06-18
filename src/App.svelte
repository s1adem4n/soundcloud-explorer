<script lang="ts">
  import List from '@/lib/components/list.svelte';
  import { loadLikes } from '@/lib/likes';

  const likes = await loadLikes();
  const reversedLikes = likes.likes.toReversed();

  let query = $state('');
</script>

<div class="relative flex h-dvh flex-col">
  <input
    class="h-10 w-full bg-white px-4 focus:outline-none"
    placeholder="search ..."
    bind:value={query}
  />

  <List likes={reversedLikes} bind:query />
</div>

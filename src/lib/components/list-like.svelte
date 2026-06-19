<script lang="ts">
  import CommentIcon from '~icons/mingcute/comment-fill';
  import HeartIcon from '~icons/mingcute/heart-fill';
  import MoreIcon from '~icons/mingcute/more-2-fill';
  import PlayIcon from '~icons/mingcute/play-fill';

  import { type Like } from '@/lib/likes';
  import { formatPossiblyBigNumber } from '@/lib/utils';

  let { like, onShowDetails }: { like: Like; onShowDetails: () => unknown } =
    $props();
</script>

<div class="flex h-16 gap-2 px-2 py-1 contain-strict">
  <img
    src={like.track.artwork_url || like.track.user.avatar_url}
    alt={like.track.title}
    loading="lazy"
    class="aspect-square h-14 w-14 rounded object-cover outline -outline-offset-1 outline-white/60"
  />
  <a
    href="soundcloud://tracks:{like.track.id}"
    target="_blank"
    class="flex min-w-0 flex-col justify-between text-xs"
  >
    <span class="truncate font-semibold">
      {like.track.title}
    </span>
    <span class="truncate opacity-80">
      {like.track.publisher_metadata?.artist || like.track.user.username}
    </span>

    <div class="flex gap-2 opacity-60">
      <div class="flex items-center gap-1">
        <PlayIcon class="h-3 w-3" />
        {formatPossiblyBigNumber(like.track.playback_count || 0)}
      </div>
      <div class="flex items-center gap-1">
        <HeartIcon class="h-3 w-3" />
        {formatPossiblyBigNumber(like.track.likes_count || 0)}
      </div>
      <div class="flex items-center gap-1">
        <CommentIcon class="h-3 w-3" />
        {like.track.comment_count || 0}
      </div>
    </div>
  </a>

  <button class="ml-auto flex min-h-full items-center" onclick={onShowDetails}>
    <MoreIcon />
  </button>
</div>

<script lang="ts">
	import { page } from '$app/state';
</script>

<h1>App error page</h1>

<div>
	<h1>{page.status}</h1>
	<p>{page.error?.message}</p>
</div>

<script lang="ts">
	import { page } from '$app/state';

	console.log(page);
</script>

<h1>SKibidi BOp</h1>

<div>
	<h1>{page.status}</h1>
	<p>{page.error?.message}</p>
</div>

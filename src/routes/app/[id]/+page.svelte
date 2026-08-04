<script>
	import Chart from '$lib/components/chart.svelte';
	let { data } = $props();
		$inspect(data); // logs data (and updates) — Svelte 5 rune

</script>

<svelte:head><title>Bruksgraf - + {data.app?.name}</title></svelte:head>
<pre>{JSON.stringify(data, null, 2)}</pre>

<div class="p-24">
	<h1 class="mb-8 text-white">{data.app.name}</h1>
	<div class="h-96">
		<Chart app={data.app} />
	</div>
</div>

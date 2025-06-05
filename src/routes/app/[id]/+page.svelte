<script>
	import Chart from '$lib/components/chart.svelte';
	let { data } = $props();
</script>

<svelte:head><title>Bruksgraf - + {data.app.name}</title></svelte:head>

<div class="p-24">
	<h1 class="mb-8 text-white">{data.app.name}</h1>
	<div class="h-96">
		<Chart app={data.app} />
	</div>
</div>

<script>
	let { data } = $props();
	import chartjs from 'chart.js';
	import { onMount } from 'svelte';
	import { getYearAndMonth, getElapsedDaysInCurrentMonth } from '$lib/utils';

	const month = getYearAndMonth();
	var days = getElapsedDaysInCurrentMonth();

	let ctx;
	let chartCanvas;

	onMount(async (promise) => {
		const chartData = await fetch(`/total-usage-chart-data?month=${month}&days=${days}`).then(
			(res) => res.json()
		);

		console.log(chartData);

		ctx = chartCanvas.getContext('2d');
		var chart = new chartjs(ctx, {
			type: 'line',
			data: {
				labels: chartData.map((e) => e.day),
				datasets: [
					{
						backgroundColor: 'rgb(123, 239, 178)',
						borderColor: 'rgb(2, 166, 127)',
						// TODO: Bug in the sql query foces us to subtract 1
						data: chartData.map((e) => e.count - 1)
					}
				]
			},
			options: {
				plugins: {
					legend: false
				},
				responsive: true,
				maintainAspectRatio: false // allow height to change
			}
		});
	});
</script>

<svelte:head>
	<title>Appmarket Kostnadsrapport</title>
</svelte:head>

<div class="relative overflow-x-auto p-8">
	<div class="mt-8 mb-16 h-96">
		<p class="mb-4 text-gray-400">Totalt antall installasjoner på tvers av plattformen</p>
		<canvas bind:this={chartCanvas} id="total-usage-chart"></canvas>
	</div>
	<div class="bg-nhn-50 rounded-lg">
		<table
			id="report"
			class="w-full text-left text-sm text-gray-500 rtl:text-right dark:text-gray-400"
		>
			<thead class="text-xs text-gray-100 uppercase dark:text-gray-400">
				<tr>
					<th scope="col" class="px-6 py-3">Applikasjon</th>
					<th scope="col" class="px-6 py-3">Antall Instanser</th>
				</tr>
			</thead>
			<tbody>
				{#each Object.entries(data.cards) as entry}
					<tr class="border-b border-gray-200 dark:border-gray-700 dark:bg-gray-800">
						<th
							scope="row"
							class="px-6 py-4 font-medium whitespace-nowrap text-gray-900 dark:text-white"
						>
							<a href={`/app/${entry[1][0].application_id}`}>
								{entry[0]}
							</a>
						</th>
						<td class="px-6 py-4"> {entry[1].length} </td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>

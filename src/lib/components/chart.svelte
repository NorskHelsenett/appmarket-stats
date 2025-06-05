<script>
	import chartjs from 'chart.js';
	import { onMount } from 'svelte';
	import { getYearAndMonth, getElapsedDaysInCurrentMonth } from '$lib/utils';

	let { app } = $props();

	const month = getYearAndMonth();
	var days = getElapsedDaysInCurrentMonth();

	let ctx;
	let chartCanvas;

	onMount(async (promise) => {
		const billable = await fetch(
			`/app/${app.id}/chart-data?month=${month}&days=${days}&billable=true`
		).then((res) => res.json());

		const nonBillable = await fetch(
			`/app/${app.id}/chart-data?month=${month}&days=${days}&billable=false`
		).then((res) => res.json());

		ctx = chartCanvas.getContext('2d');
		var chart = new chartjs(ctx, {
			type: 'line',
			data: {
				labels: billable.map((e) => e.day),
				datasets: [
					{
						backgroundColor: '#6B1E27',
						borderColor: '#69232b',
						data: nonBillable.map((e) => e.count)
					},
					{
						backgroundColor: 'rgb(123, 239, 178)',
						borderColor: 'rgb(2, 166, 127)',
						data: billable.map((e) => e.count)
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

<canvas bind:this={chartCanvas} id="myChart"></canvas>

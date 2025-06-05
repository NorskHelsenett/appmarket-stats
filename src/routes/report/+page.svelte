<script>
	let { data } = $props();
	import Table from '$lib/components/groupedInstanceTable.svelte';

	import { utils, writeFile } from 'xlsx';

	function exportToExcel() {
		const sheet = [];
		sheet.push(['Applikasjon', 'Cluster', 'Arbeidsordre']);
		data.instances.forEach((instance) =>
			sheet.push([instance.application_name, instance.cluster_name, instance.workorder])
		);

		const ws = utils.aoa_to_sheet(sheet);

		// Create workbook
		const wb = utils.book_new();
		utils.book_append_sheet(wb, ws, 'Sheet1');

		// Export the file
		writeFile(wb, 'Rapport.xlsx');
	}

	let grouped = Object.entries(
		data.instances.reduce((acc, instance) => {
			const pid = String(instance.project_id).trim();
			if (!pid) return acc;
			if (!acc[pid]) acc[pid] = [];
			acc[pid].push(instance);
			return acc;
		}, {})
	).sort(([pidA, instancesA], [pidB, instancesB]) => {
		// Get the first project name from each group (assuming each group has at least one instance)
		const nameA = instancesA[0]?.project_name?.charAt(0).toUpperCase() || '';
		const nameB = instancesB[0]?.project_name?.charAt(0).toUpperCase() || '';
		return nameA.localeCompare(nameB);
	});
</script>

<svelte:head>
	<title>Appmarket Kostnadsrapport</title>
</svelte:head>

<div class="relative overflow-x-auto p-8">
	<button
		onclick={exportToExcel}
		type="button"
		class="bg-nhn-50 hover:bg-nhn-100 me-2 mb-2 rounded-lg px-5 py-2.5 text-sm font-medium text-white focus:ring-1 focus:outline-none"
		>Eksporter til Excel</button
	>

	{#each grouped as [project_id, group]}
		<Table {group} />
	{/each}
</div>

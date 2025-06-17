<script>
	let { data } = $props();
	import Table from '$lib/components/groupedInstanceTable.svelte';

	import { utils, writeFile } from 'xlsx';

	//function exportToExcel() {
	//	const sheet = [];

	//	// need to add applications to the header. Filter through instances and group applications by name.

	//	sheet.push(['Prosjekt', 'Arbeidsordre', 'Total' /* Apps... */]);

	//	// filter through instances and count the amount of each instance based on the work order
	//	data.instances.forEach((instance) => sheet.push([instance.project_name, instance.workorder]));

	//	const ws = utils.aoa_to_sheet(sheet);

	//	// Create workbook
	//	const wb = utils.book_new();
	//	utils.book_append_sheet(wb, ws, 'Sheet1');

	//	// Export the file
	//	writeFile(wb, 'Rapport.xlsx');
	//}

	function exportToExcel() {
		const sheet = [];

		// First, collect all unique application names
		const allApps = new Set();
		const workOrderData = {};

		// Group instances by work order and collect application names
		data.instances.forEach((instance) => {
			if (!workOrderData[instance.workorder]) {
				workOrderData[instance.workorder] = {
					projectName: instance.project_name,
					apps: {},
					totalPrice: 0 // Initialize price accumulator
				};
			}

			// Count applications for this work order and accumulate price
			if (instance.application_name) {
				allApps.add(instance.application_name);
				workOrderData[instance.workorder].apps[instance.application_name] =
					(workOrderData[instance.workorder].apps[instance.application_name] || 0) + 1;
			}

			// Add instance price to work order total (assuming price is a number)
			workOrderData[instance.workorder].totalPrice += Number(instance.price) || 0;
		});

		// Create header row (added 'Total Price' column)
		const header = ['Prosjekt', 'Arbeidsordre', 'Total Pris', ...Array.from(allApps).sort()];
		sheet.push(header);

		// Add data rows
		Object.entries(workOrderData).forEach(([workorder, data]) => {
			const row = [data.projectName, workorder];
			row.push(data.totalPrice);

			// Calculate total application count
			const totalApps = Object.values(data.apps).reduce((sum, count) => sum + count, 0);
			row.push(totalApps);

			// Add total price

			// Add counts for each application (in the same order as header)
			for (let i = 3; i < header.length; i++) {
				// Note index starts at 4 now
				const appName = header[i];
				row.push(data.apps[appName] || 0);
			}

			sheet.push(row);
		});

		const ws = utils.aoa_to_sheet(sheet);
		const wb = utils.book_new();
		utils.book_append_sheet(wb, ws, 'Sheet1');
		writeFile(wb, 'Rapport.xlsx');
	}

	let grouped = Object.entries(
		data.instances.reduce((acc, instance) => {
			const pid = String(instance.project_id).trim();
			if (!pid) return acc;

			// Initialize project group if needed
			if (!acc[pid]) acc[pid] = {};

			const appId = instance.application_id;
			const appName = instance.application_name;

			// Initialize the application entry if needed
			if (!acc[pid][appId]) {
				acc[pid][appId] = {
					app: appId,
					name: appName,
					price: instance.price,
					instances: 0,
					billable_instances: 0,
					project_name: instance.project_name // store one project name for sorting
				};
			}

			// Increment the count of instances
			if (instance.billable) acc[pid][appId].billable_instances += 1;
			acc[pid][appId].instances += 1;

			return acc;
		}, {})
	)
		.map(([pid, appMap]) => [pid, Object.values(appMap)])
		.sort(([pidA, appsA], [pidB, appsB]) => {
			const nameA = appsA[0]?.project_name?.charAt(0).toUpperCase() || '';
			const nameB = appsB[0]?.project_name?.charAt(0).toUpperCase() || '';
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

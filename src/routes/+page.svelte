<script>
	let { data } = $props();
	console.log(data.instances);
</script>

<div class="relative overflow-x-auto p-8">
	<table class="w-full text-left text-sm text-gray-500 rtl:text-right dark:text-gray-400">
		<thead class="bg-nhn-50 text-xs text-gray-100 uppercase dark:bg-gray-700 dark:text-gray-400">
			<tr>
				<th scope="col" class="px-6 py-3"> Applikasjon </th>
				<th scope="col" class="px-6 py-3"> Cluster </th>
				<th scope="col" class="px-6 py-3"> Workorder </th>
			</tr>
		</thead>
		<tbody>
			{#each data.instances as instance}
				<tr class="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
					<th
						scope="row"
						class="px-6 py-4 font-medium whitespace-nowrap text-gray-900 dark:text-white"
					>
						{instance.application_name}
					</th>
					<td class="px-6 py-4"> {instance.cluster_name} </td>
					<td class="px-6 py-4"> {instance.workorder}</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

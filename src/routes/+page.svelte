<script>
	let { data } = $props();
</script>

<svelte:head>
	<title>Appmarket Kostnadsrapport</title>
</svelte:head>

<div class="relative overflow-x-auto p-8">
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

<script>
	let { group } = $props();

	let collapsed = $state(true);
</script>

<div class="bg-nhn-50 mt-4 rounded-lg">
	<button
		class="flex w-full flex-row items-center justify-between pr-4 focus:outline-none"
		onclick={() => (collapsed = !collapsed)}
	>
		<p class="mt-1 mb-1 px-6 py-3 text-sm text-gray-400">{group[0].project_name}</p>
		<div
			class="h-4 w-4 fill-gray-400 transition-transform duration-200"
			class:rotate-180={!collapsed}
		>
			<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path d="M16 10V11L11 16L6 11V10L10 10V4L1 4L1 2L12 2V10H16Z" class="fill-gray-400" />
			</svg>
		</div>
	</button>
	{#if !collapsed}
		<div>
			<table class="w-full text-left text-sm text-gray-500 rtl:text-right dark:text-gray-400">
				<thead class="text-xs text-gray-100 uppercase dark:text-gray-400">
					<tr>
						<th scope="col" class="px-6 py-3">Applikasjon</th>
						<th scope="col" class="mb-3 px-6 py-3">Pris</th>
						<th scope="col" class="mb-3 px-6 py-3">Antall instanser</th>
						<th scope="col" class="mb-3 px-6 py-3">Antall Fakturerbare instanser</th>
					</tr>
				</thead>
				<tbody>
					{#each group as instance}
						<tr class="border-b border-gray-200 dark:border-gray-700 dark:bg-gray-800">
							<th
								scope="row"
								class="px-6 py-4 font-medium whitespace-nowrap text-gray-900 dark:text-white"
							>
								{instance.name}
							</th>
							<td class="px-6 py-4">{instance.price} KR</td>
							<td class="px-6 py-4">{instance.instances}</td>
							<td class="px-6 py-4">{instance.billable_instances}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>

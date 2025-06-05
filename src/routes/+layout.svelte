<script>
	import '../app.css';
	import logo from '$lib/assets/logo.svg';
	import { goto } from '$app/navigation';

	let { children } = $props();

	function redirectToReport() {
		goto('/report');
	}
</script>

<div class="min-h-screen bg-black">
	<nav class="border-gray-200">
		<div class="flex flex-wrap items-center justify-between p-4">
			<a href="/" class="flex items-center space-x-3 rtl:space-x-reverse">
				<img class="h-12 w-20" src={logo} alt="NHN logo" />
				<span class="self-center text-2xl font-semibold whitespace-nowrap dark:text-white"
					>Appmarket kostnadsrapport</span
				>
			</a>
			<div class="hidden w-full md:block md:w-auto" id="navbar-default">
				<ul
					class="mt-4 flex flex-col rounded-lg border border-gray-100 p-4 font-medium md:mt-0 md:flex-row md:space-x-8 md:border-0 md:p-0 rtl:space-x-reverse"
				>
					<li>
						<button
							onclick={redirectToReport}
							class="bg-nhn-50 hover:bg-nhn-100 rounded-lg px-5 py-2.5 text-sm font-medium text-white focus:ring-1 focus:outline-none"
							>Kostnadsrapport
						</button>
					</li>
					<li>
						<a
							href="https://docs.nhn.no"
							class="hover:text-nhn-primary-50 block rounded-sm px-3 py-2 text-white">Docs</a
						>
					</li>
					<li>
						<a
							href="https://ror.nhn.no"
							class="hover:text-nhn-primary-50 block rounded-sm px-3 py-2 text-white">ROR</a
						>
					</li>
				</ul>
			</div>
		</div>
	</nav>

	{@render children()}
</div>

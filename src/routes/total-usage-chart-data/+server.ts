import { json } from '@sveltejs/kit';
import { getTotalUsageTimeseries } from '$lib/api';

export async function GET({ params, url }: any) {
	let month = url.searchParams.get('month') || '';
	let days = url.searchParams.get('days') || 0;
	const result = await getTotalUsageTimeseries(month, days);
	return json(result);
}

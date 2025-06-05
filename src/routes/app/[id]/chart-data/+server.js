import { json } from '@sveltejs/kit';
import { getApplicationTimeseries } from '$lib/api';

export async function GET({ params, url }) {
	let month = url.searchParams.get('month');
	let days = url.searchParams.get('days');
	let billable = url.searchParams.get('billable') || true;
	const result = await getApplicationTimeseries(month, days, params.id, billable);
	return json(result);
}

import { getInstances } from '$lib/api';

export const load = async ({ locals }) => {
	console.log('heloo');
	try {
		const instances = await getInstances();
		return {
			instances
		};
	} catch (err) {
		console.error(err);
		return { status: 500 };
	}
};

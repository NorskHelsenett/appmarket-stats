import { getInstances } from '$lib/api';

export const load = async ({ locals }) => {
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

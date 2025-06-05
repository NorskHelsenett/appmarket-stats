import { getApplicationById } from '$lib/api';

export const load = async ({ locals, params }) => {
	try {
		const app = await getApplicationById(params.id);
		return {
			app: app[0]
		};
	} catch (err) {
		console.error(err);
		return { status: 500 };
	}
};

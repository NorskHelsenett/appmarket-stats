import { getApplicationById } from '$lib/api';
import { error } from '@sveltejs/kit';

export const load = async ({ locals, params }: any) => {
	
		const app = await getApplicationById(params.id);
		if (!app) {
		throw error(404, `Application ${params.id} not found`);
	}

		return {
			app: app[0]
		};
 
};

import { getInstances } from '$lib/api';

export const load = async ({ locals }: any) => {
	try {
		const instances = await getInstances();
		const cards = instances.reduce((r: any, a: any) => {
			r[a.application_name] = r[a.application_name] || [];
			r[a.application_name].push(a);
			return r;
		}, Object.create(null));

		return {
			cards
		};
	} catch (err) {
		console.error(err);
		return { status: 500 };
	}
};

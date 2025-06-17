export async function getPriceList() {
	const data = await fetch(
		'https://helsegitlab.nhn.no/api/v4/projects/1343/repository/files/PRISER.csv/raw?ref=master',
		{
			headers: {
				'PRIVATE-TOKEN': process.env.GITLAB_TOKEN
			}
		}
	);

	const rawData = (await data.text()).replaceAll(' ', '').replaceAll('\t', '').split('\n');

	// Remove the CSV headers
	rawData.shift();

	return new Map(rawData.map((l) => l.split(',')));
}

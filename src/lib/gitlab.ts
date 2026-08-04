export async function getPriceList() {
	let data: Response
	const token = process.env.GITLAB_TOKEN;
	if (!token) {
		throw new Error('GITLAB_TOKEN is not defined in environment variables');
	}

	try {
	 data = await fetch(
		'https://helsegitlab.nhn.no/api/v4/projects/1343/repository/files/PRISER.csv/raw?ref=master',
		{
			headers: {
				'PRIVATE-TOKEN': token
			}
		}
	);
} catch (err) {
  console.error('Error fetching price list: ', err);
    throw err;
}
	const rawData = (await data.text()).replaceAll(' ', '').replaceAll('\t', '').split('\n');

	// Remove the CSV headers
	rawData.shift();
const entries = rawData.map((l) => l.split(',')).filter((cols): cols is [string, string] => cols.length >= 2)
    .map((cols) => [cols[0], cols[1]] as [string, string])
	
	return new Map(entries);


}

import _db from './_db';

/** Use a singleton DB instance */
const db = _db.instance;

export async function getInstances() {
	const result = await db.query(`
  SELECT
      i.id AS instance_id,
      i.application_id,
      i.cluster_id,
      a.id AS application_id,
      a.name AS application_name,
      c.id AS cluster_id,
      c.name AS cluster_name,
      c.workorder
  FROM
      instances i
  JOIN
      applications a ON i.application_id = a.id
  JOIN
      clusters c ON i.cluster_id = c.id;
      `);

	return result;
}

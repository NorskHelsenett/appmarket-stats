import _db from './_db';
import { getPriceList } from './gitlab';

/** Use a singleton DB instance */
const db = _db.instance;

export async function getInstances() {
	const priceList = await getPriceList();
	const result = await db.query(`
    SELECT DISTINCT ON (i.application_id, i.cluster_id)
        i.id AS instance_id,
        i.application_id,
        i.cluster_id,
        i.billable as billable,
        a.name AS application_name,
        c.name AS cluster_name,
        c.project_name AS project_name,
        c.project_id AS project_id,
        c.workorder,
        i.created_at
    FROM
        instances i
    JOIN
        applications a ON i.application_id = a.id
    JOIN
        clusters c ON i.cluster_id = c.id
    ORDER BY
        i.application_id, i.cluster_id, i.created_at DESC;
  `);

	return result.map((i) => {
		i.price = priceList.get(i.application_name);
		return i;
	});
}

export async function getApplicationTimeseries(month, days, application_id, billable) {
	const startDate = `${month}-01`;

	const query = `
WITH date_series AS (
  SELECT generate_series(
    $1::date,
    $1::date + INTERVAL '${days - 1} days',
    INTERVAL '1 day'
  )::date AS day
),
counts AS (
  SELECT
    created_at::date AS day,
    COUNT(DISTINCT cluster_id) AS count  -- count unique instances per day
  FROM instances
  WHERE application_id = $2
    AND billable = $3
    AND created_at >= $1
    AND created_at < ($1::date + INTERVAL '${days} days')
  GROUP BY created_at::date
)
SELECT
  date_series.day,
  COALESCE(counts.count, 0) AS count
FROM date_series
LEFT JOIN counts ON date_series.day = counts.day
ORDER BY date_series.day;
  `;

	const values = [startDate, application_id, billable];
	const result = await db.any(query, values);
	return result;
}

export async function getApplicationById(id) {
	const query = `SELECT * FROM applications WHERE id = $1`;
	const result = await db.any(query, [id]);
	return result;
}

export async function getTotalUsageTimeseries(month, days) {
	const startDate = `${month}-01`;

	const query = `
WITH
-- Generate the date series for the last X days
date_series AS (
  SELECT generate_series(
    CURRENT_DATE - INTERVAL '${days - 1} days',
    CURRENT_DATE,
    INTERVAL '1 day'
  )::date AS day
),

-- Get the most recent record for each app+cluster before each date
daily_counts AS (
  SELECT
    ds.day,
    COUNT(DISTINCT (i.application_id, i.cluster_id)) AS unique_pairs_count
  FROM date_series ds
  LEFT JOIN LATERAL (
    SELECT DISTINCT ON (application_id, cluster_id)
           application_id,
           cluster_id
    FROM instances
    WHERE created_at <= ds.day + INTERVAL '1 day'  -- Include full day
    ORDER BY application_id, cluster_id, created_at DESC
  ) i ON true
  GROUP BY ds.day
)

-- Final result with all days and counts
SELECT
  day,
  COALESCE(unique_pairs_count, 0) AS count
FROM date_series
LEFT JOIN daily_counts USING (day)
ORDER BY day;

   `;

	const values = [days];
	const result = await db.any(query, values);
	return result;
}

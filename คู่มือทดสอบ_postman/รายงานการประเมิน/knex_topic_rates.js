
// knex_topic_rates.js
// Purpose: Per-topic rate (0..1) + contribution to 60 for a given period.
// Usage: node knex_topic_rates.js 1

const knex = require('knex')({
  client: 'mysql2',
  connection: {
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'evaluation'
  }
});

async function main(periodId = 1) {
  const sql = `
    SELECT
      x.evaluatee_id,
      x.topic_id,
      t.code AS topic_code,
      t.name_th AS topic_name,
      t.weight AS topic_weight,
      ROUND(x.topic_rate, 4) AS topic_rate_0_1,
      ROUND(x.topic_rate * t.weight, 4) AS topic_score_on_60_part
    FROM (
      SELECT
        r.evaluatee_id,
        i.topic_id,
        SUM(
          (CASE
             WHEN i.type = 'score_1_4' AND r.score IS NOT NULL THEN r.score / 4.0
             WHEN i.type = 'yes_no'    AND r.yes_no IS NOT NULL THEN r.yes_no * 1.0
             ELSE NULL
           END) * i.weight
        ) / NULLIF(SUM(CASE WHEN i.type IN ('score_1_4','yes_no') THEN i.weight ELSE 0 END), 0) AS topic_rate
      FROM results r
      JOIN indicators i ON i.id = r.indicator_id
      WHERE r.status IN ('draft','submitted')
        AND r.period_id = ?
        AND i.type IN ('score_1_4','yes_no')
      GROUP BY r.evaluatee_id, i.topic_id
    ) x
    JOIN evaluation_topics t ON t.id = x.topic_id
    ORDER BY x.evaluatee_id, x.topic_id;
  `;

  const rows = await knex.raw(sql, [periodId]);
  console.table(rows[0]);
  await knex.destroy();
}

main(process.argv[2]).catch(e => {
  console.error(e);
  process.exit(1);
});

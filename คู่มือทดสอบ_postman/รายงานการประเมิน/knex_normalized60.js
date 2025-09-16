
// knex_normalized60.js
// Purpose: Final Normalized/60 per evaluatee per period.
// Usage: node knex_normalized60.js 1

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
      y.period_id,
      y.evaluatee_id,
      ROUND(SUM(y.topic_rate * t.weight), 4) AS normalized_60
    FROM (
      SELECT
        r.period_id,
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
      GROUP BY r.period_id, r.evaluatee_id, i.topic_id
    ) y
    JOIN evaluation_topics t ON t.id = y.topic_id
    GROUP BY y.period_id, y.evaluatee_id
    ORDER BY y.period_id, y.evaluatee_id;
  `;

  const rows = await knex.raw(sql, [periodId]);
  console.table(rows[0]);
  await knex.destroy();
}

main(process.argv[2]).catch(e => {
  console.error(e);
  process.exit(1);
});

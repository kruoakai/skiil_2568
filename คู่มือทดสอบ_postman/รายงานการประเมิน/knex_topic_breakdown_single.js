
// knex_topic_breakdown_single.js
// Purpose: Per-topic breakdown for one evaluatee in a period.
// Usage: node knex_topic_breakdown_single.js 1 23

const knex = require('knex')({
  client: 'mysql2',
  connection: {
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'evaluation'
  }
});

async function main(periodId = 1, evaluateeId = 1) {
  const sql = `
    SELECT
      t.id AS topic_id,
      t.code AS topic_code,
      t.name_th AS topic_name,
      t.weight AS topic_weight,
      ROUND(SUM(
        (CASE
          WHEN i.type='score_1_4' AND r.score IS NOT NULL THEN r.score / 4.0
          WHEN i.type='yes_no'    AND r.yes_no IS NOT NULL THEN r.yes_no * 1.0
          ELSE NULL
        END) * i.weight
      ) / NULLIF(SUM(
        CASE WHEN i.type IN ('score_1_4','yes_no') THEN i.weight ELSE 0 END
      ),0), 4) AS topic_rate_0_1,
      ROUND(
        (
          SUM(
            (CASE
              WHEN i.type='score_1_4' AND r.score IS NOT NULL THEN r.score / 4.0
              WHEN i.type='yes_no'    AND r.yes_no IS NOT NULL THEN r.yes_no * 1.0
              ELSE NULL
            END) * i.weight
          ) / NULLIF(SUM(
            CASE WHEN i.type IN ('score_1_4','yes_no') THEN i.weight ELSE 0 END
          ),0)
        ) * t.weight
      , 4) AS topic_score_on_60_part
    FROM evaluation_topics t
    JOIN indicators i ON i.topic_id = t.id
    LEFT JOIN results r
      ON r.indicator_id = i.id
     AND r.period_id = ?
     AND r.evaluatee_id = ?
    WHERE i.type IN ('score_1_4','yes_no')
    GROUP BY t.id, t.code, t.name_th, t.weight
    ORDER BY t.id;
  `;

  const rows = await knex.raw(sql, [periodId, evaluateeId]);
  console.table(rows[0]);
  await knex.destroy();
}

main(process.argv[2], process.argv[3]).catch(e => {
  console.error(e);
  process.exit(1);
});

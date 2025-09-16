// repositories/indicatorEvidence.js
const db = require('../db/knex');

exports.mapExists = async ({ indicator_id, evidence_type_id }) => {
  const row = await db('indicator_evidence')
    .where({ indicator_id, evidence_type_id })
    .first();
  return !!row;
};

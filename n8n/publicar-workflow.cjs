/**
 * Publica (activa) un workflow importado por CLI en n8n 1.12x.
 *
 * Desde n8n 1.11x un workflow solo queda activo si apunta a una versión publicada
 * en `workflow_history` (columna activeVersionId). `n8n import:workflow` no crea esa
 * versión y `n8n update:workflow --active=true` falla por la llave foránea, así que
 * este script crea la versión y la marca como activa antes de arrancar n8n.
 *
 * Uso (dentro del contenedor, con n8n detenido):  node publicar-workflow.cjs <workflowId>
 * Probado con la imagen n8nio/n8n:1.123.5 (base SQLite por defecto).
 */
'use strict';
const path = require('node:path');

const N8N_DIR = '/usr/local/lib/node_modules/n8n';
const sqlite3 = require(require.resolve('sqlite3', { paths: [N8N_DIR] }));

const workflowId = process.argv[2];
if (!workflowId) {
  console.error('Uso: node publicar-workflow.cjs <workflowId>');
  process.exit(2);
}
const dbFile = path.join(process.env.N8N_USER_FOLDER || '/home/node', '.n8n', 'database.sqlite');
const db = new sqlite3.Database(dbFile);

const run = (sql, params = []) =>
  new Promise((ok, ko) => db.run(sql, params, function (err) { err ? ko(err) : ok(this); }));
const get = (sql, params = []) =>
  new Promise((ok, ko) => db.get(sql, params, (err, row) => (err ? ko(err) : ok(row))));

(async () => {
  await run('PRAGMA foreign_keys = ON');
  const wf = await get('SELECT id, name, versionId, nodes, connections FROM workflow_entity WHERE id = ?', [workflowId]);
  if (!wf) throw new Error(`No existe el workflow ${workflowId}`);

  await run('BEGIN');
  try {
    await run(
      `INSERT INTO workflow_history (versionId, workflowId, authors, nodes, connections, name, autosaved)
       VALUES (?, ?, ?, ?, ?, ?, 0)
       ON CONFLICT(versionId) DO UPDATE SET nodes = excluded.nodes, connections = excluded.connections,
         name = excluded.name, updatedAt = STRFTIME('%Y-%m-%d %H:%M:%f', 'NOW')`,
      [wf.versionId, wf.id, 'Campuslands (importación automática)', wf.nodes, wf.connections, wf.name],
    );
    await run('UPDATE workflow_entity SET active = 1, activeVersionId = versionId WHERE id = ?', [wf.id]);
    await run(`INSERT INTO workflow_publish_history (workflowId, versionId, event, userId) VALUES (?, ?, 'activated', NULL)`, [
      wf.id,
      wf.versionId,
    ]);
    await run('COMMIT');
  } catch (e) {
    await run('ROLLBACK');
    throw e;
  }
  console.log(`[campuslands] Workflow "${wf.name}" publicado y activo (versión ${wf.versionId}).`);
  db.close();
})().catch((e) => {
  console.error(`[campuslands] No se pudo activar el workflow automáticamente: ${e.message}`);
  console.error('[campuslands] Actívalo desde el editor de n8n (interruptor «Active» / «Publish»).');
  db.close();
  process.exit(1);
});

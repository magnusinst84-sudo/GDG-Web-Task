/**
 * Records an administrative mutation action into the auditLog collection in Firestore.
 * Executed server-side only via firebase-admin.
 * Designed to swallow and log internal errors so audit failures do not block primary operations.
 *
 * @param {import('firebase-admin/firestore').Firestore} db - Firestore database instance
 * @param {object} params
 * @param {string} params.adminEmail - Email of the admin user executing the mutation
 * @param {string} params.action - Name/identifier of the mutation action
 * @param {string} params.targetId - Document ID of target record
 * @param {object} [params.details] - Details of state changes (no full PII)
 */
export async function logAuditEvent(db, { adminEmail, action, targetId, details = {} }) {
  try {
    await db.collection("auditLog").add({
      adminEmail: adminEmail || "unknown",
      action,
      targetId,
      details,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error("[AuditLog Error] Failed to write audit log entry:", error);
  }
}

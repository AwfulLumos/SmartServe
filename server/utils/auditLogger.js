const AuditLog = require("../models/AuditLog");

/**
 * Non-fatal audit logger. Call anywhere — failures are silently swallowed.
 *
 * @param {object} opts
 * @param {string}  opts.action      Short action label, e.g. "Order Placed"
 * @param {string}  opts.actorType   "admin" | "staff" | "student" | "system"
 * @param {*}       [opts.actorId]   MongoDB ObjectId of the actor
 * @param {string}  [opts.actorName] Display name of the actor
 * @param {string}  [opts.description] Human-readable detail sentence
 * @param {string}  [opts.category]  One of the enum values in AuditLog schema
 * @param {object}  [opts.meta]      Any extra key/value pairs
 */
async function logAudit({ action, actorType, actorId = null, actorName = "System", description = "", category = "system", meta = {} }) {
  try {
    await AuditLog.create({ action, actorType, actorId, actorName, description, category, meta });
  } catch (_) {
    // Audit logging must never crash the main request
  }
}

module.exports = logAudit;

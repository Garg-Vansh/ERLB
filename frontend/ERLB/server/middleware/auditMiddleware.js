import AuditLog from '../models/auditLogModel.js';

export const writeAuditLog = async ({ req, action, targetType, targetId, details = {} }) => {
  if (!req?.user) return;

  await AuditLog.create({
    actor: req.user._id,
    actorEmail: req.user.email,
    action,
    targetType,
    targetId,
    details,
    ipAddress: req.ip,
    userAgent: req.get('user-agent')
  });
};

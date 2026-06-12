import { data } from "@/app/lib/data";
import type {
  AuditEntityType,
  User,
} from "@/app/lib/data/types";

export async function recordAudit({
  action,
  actor,
  after,
  before,
  entityId,
  entityType,
  summary,
}: {
  action: string;
  actor: User;
  after?: unknown;
  before?: unknown;
  entityId: string;
  entityType: AuditEntityType;
  summary: string;
}) {
  try {
    await data.createAuditLog({
      action,
      actorId: actor.id,
      actorName: actor.name,
      after,
      before,
      entityId,
      entityType,
      summary,
    });
  } catch (error) {
    console.error("Could not write audit log", error);
  }
}

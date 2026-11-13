export type StaffRole = "SUPER_ADMIN" | "COMMERCE_ADMIN" | "PRODUCTION_STAFF" | "SUPPORT_STAFF";

export type AdminTabId =
  | "OVERVIEW"
  | "ORDERS"
  | "PRODUCTION"
  | "DISPATCH"
  | "TICKETS"
  | "CUSTOMERS"
  | "PROPOSALS"
  | "CATALOGUE"
  | "PINCODES"
  | "SETTINGS"
  | "AUDIT";

export type AdminAction =
  | "WORKSHOP_RELEASE"
  | "QC_PHOTO_UPLOAD"
  | "DISPATCH_AWB"
  | "ORDER_REFUND_MANAGE"
  | "ORDER_CANCEL"
  | "PROPOSAL_CREATE_REVISE"
  | "TICKET_MANAGE"
  | "CATALOGUE_MUTATE"
  | "PINCODES_MUTATE"
  | "SETTINGS_MUTATE"
  | "AUDIT_VIEW";

/**
 * Tab accessibility map per staff role.
 */
export const ROLE_TAB_PERMISSIONS: Record<StaffRole, AdminTabId[]> = {
  SUPER_ADMIN: [
    "OVERVIEW",
    "ORDERS",
    "PRODUCTION",
    "DISPATCH",
    "TICKETS",
    "CUSTOMERS",
    "PROPOSALS",
    "CATALOGUE",
    "PINCODES",
    "SETTINGS",
    "AUDIT",
  ],
  COMMERCE_ADMIN: [
    "OVERVIEW",
    "ORDERS",
    "DISPATCH",
    "PROPOSALS",
    "CATALOGUE",
    "PINCODES",
    "CUSTOMERS",
    "AUDIT",
  ],
  PRODUCTION_STAFF: [
    "OVERVIEW",
    "ORDERS",
    "PRODUCTION",
    "DISPATCH",
    "CATALOGUE",
    "AUDIT",
  ],
  SUPPORT_STAFF: [
    "OVERVIEW",
    "ORDERS",
    "DISPATCH",
    "TICKETS",
    "CUSTOMERS",
    "PROPOSALS",
  ],
};

/**
 * Granular action execution permission map per role.
 */
export const ROLE_ACTION_PERMISSIONS: Record<StaffRole, AdminAction[]> = {
  SUPER_ADMIN: [
    "WORKSHOP_RELEASE",
    "QC_PHOTO_UPLOAD",
    "DISPATCH_AWB",
    "ORDER_REFUND_MANAGE",
    "ORDER_CANCEL",
    "PROPOSAL_CREATE_REVISE",
    "TICKET_MANAGE",
    "CATALOGUE_MUTATE",
    "PINCODES_MUTATE",
    "SETTINGS_MUTATE",
    "AUDIT_VIEW",
  ],
  COMMERCE_ADMIN: [
    "DISPATCH_AWB",
    "ORDER_REFUND_MANAGE",
    "ORDER_CANCEL",
    "PROPOSAL_CREATE_REVISE",
    "CATALOGUE_MUTATE",
    "PINCODES_MUTATE",
    "AUDIT_VIEW",
  ],
  PRODUCTION_STAFF: [
    "WORKSHOP_RELEASE",
    "QC_PHOTO_UPLOAD",
    "DISPATCH_AWB",
    "AUDIT_VIEW",
  ],
  SUPPORT_STAFF: [
    "TICKET_MANAGE",
    "ORDER_CANCEL",
  ],
};

export function isTabPermitted(role: StaffRole, tabId: AdminTabId): boolean {
  return ROLE_TAB_PERMISSIONS[role]?.includes(tabId) ?? false;
}

export function isActionPermitted(role: StaffRole, action: AdminAction): boolean {
  return ROLE_ACTION_PERMISSIONS[role]?.includes(action) ?? false;
}


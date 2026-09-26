import { Router } from "express";
import auth from "../middlewares/auth.middleware.js";
import role from "../middlewares/role.middleware.js";
import { zodValidate } from "../middlewares/zodValidate.middleware.js";
import {
  inviteUserSchema,
  orgIdParamSchema,
  userIdParamSchema,
} from "../validators/organization.validator.js";
import {
  inviteUser,
  acceptInvite,
  getOrganizationMembers,
  getPendingInvites,
  deactivateMember,
} from "../controllers/organization.controller.js";

const router = Router();

router.post("/invite", auth, role("ADMIN"), zodValidate(inviteUserSchema), inviteUser);
router.post("/accept-invite", acceptInvite);

// Get organization members
router.get(
  "/members",
  auth,
  role("ADMIN"),
  getOrganizationMembers
);

// Get pending invites
router.get(
  "/invites",
  auth,
  role("ADMIN"),
  getPendingInvites
);

// Deactivate member - validate both orgId and userId params
router.patch(
  "/:orgId/members/:userId/deactivate",
  auth,
  role("ADMIN"),
  zodValidate(
    orgIdParamSchema.merge(userIdParamSchema),
    "params"
  ),
  deactivateMember
);

export default router;
import { Router } from "express";
import { validateIdParam } from "../middleware/validateIdParam.js";
import {
  listMembers,
  getMember,
  createMember,
  updateMember,
  deleteMember,
} from "../controllers/members.controller.js";

const router = Router();

router.get("/", listMembers);
router.get("/:id", validateIdParam(), getMember);
router.post("/", createMember);
router.put("/:id", validateIdParam(), updateMember);
router.delete("/:id", validateIdParam(), deleteMember);

export default router;

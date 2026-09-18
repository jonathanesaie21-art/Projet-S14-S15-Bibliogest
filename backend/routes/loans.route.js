import { Router } from "express";
import { validateIdParam } from "../middleware/validateIdParam.js";
import {
  listLoans,
  createLoan,
  returnLoan,
} from "../controllers/loans.controller.js";

const router = Router();

router.get("/", listLoans);
router.post("/", createLoan);
router.post("/:id/return", validateIdParam(), returnLoan);

export default router;

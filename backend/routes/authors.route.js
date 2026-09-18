import { Router } from "express";
import { validateIdParam } from "../middleware/validateIdParam.js";
import {
  listAuthors,
  getAuthor,
  createAuthor,
  updateAuthor,
  deleteAuthor,
} from "../controllers/authors.controller.js";

const router = Router();

router.get("/", listAuthors);
router.get("/:id", validateIdParam(), getAuthor);
router.post("/", createAuthor);
router.put("/:id", validateIdParam(), updateAuthor);
router.delete("/:id", validateIdParam(), deleteAuthor);

export default router;

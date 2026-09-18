import { Router } from "express";
import { validateIdParam } from "../middleware/validateIdParam.js";
import {
  listBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook,
  reserveBook,
} from "../controllers/books.controller.js";

const router = Router();

router.get("/", listBooks);
router.get("/:id", validateIdParam(), getBook);
router.post("/", createBook);
router.put("/:id", validateIdParam(), updateBook);
router.delete("/:id", validateIdParam(), deleteBook);
router.post("/:id/reserve", validateIdParam(), reserveBook);

export default router;

import { Router } from "express";
import auth from "../../middleware/auth";
import { createIssue, deleteIssue,  getAllIssues,  getSingleIssue, updateIssue } from './../controllers/issue.controller';


const router = Router();

router.post("/", auth("contributor", "maintainer"), createIssue);
router.get("/", getAllIssues);
router.get("/:id", getSingleIssue);
router.patch("/:id", auth("contributor", "maintainer"), updateIssue);
router.delete("/:id", auth("maintainer"), deleteIssue);

export default router;
import express from 'express';
import { protect } from '../middlewares/protect.js';
import { createJob, matchJobs } from '../controllers/job.controller.js';
const router = express.Router();

router.post("/create",protect,createJob)
router.get("/match",protect,matchJobs)

export default router;
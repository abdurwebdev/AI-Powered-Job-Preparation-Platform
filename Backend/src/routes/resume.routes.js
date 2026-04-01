import express from "express";
import { uploadResume } from "../controllers/resume.controller.js";
import {protect} from "../middlewares/protect.js";
import upload from "../middlewares/upload.js";
import { resumeValidation } from "../middlewares/validator.js";

const router = express.Router();

router.post("/upload", protect, upload.single("resume"),resumeValidation, uploadResume);

export default router;
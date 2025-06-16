import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";

// yeh 1000 baar use hoga

const router = Router()

router.route("/register").post(registerUser)

export default router
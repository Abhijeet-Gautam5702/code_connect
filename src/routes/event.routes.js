import { Router } from "express";
import multerUpload from "../middlewares/multer.middlewares.js";
import { verifyUserToken } from "../middlewares/auth.middlewares.js";
import { addEvent } from "../controllers/event.controllers.js";

const eventRouter = Router();

// Secured route

eventRouter
  .route("/add-event")
  .post(multerUpload.single("thumbnail"), verifyUserToken, addEvent);

export default eventRouter;

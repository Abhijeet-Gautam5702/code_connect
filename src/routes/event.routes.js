import { Router } from "express";
import multerUpload from "../middlewares/multer.middlewares.js";
import { verifyUserToken } from "../middlewares/auth.middlewares.js";
import {
  addEvent,
  eventRegister,
  eventDeregister,
  updateEventDetails,
  updateEventThumbnail,
  deleteEvent,
  getAllEvents,
  getEventById,
} from "../controllers/event.controllers.js";

const eventRouter = Router();

// Secured routes

eventRouter.route("/get-all-events").get(verifyUserToken, getAllEvents);

eventRouter
  .route("/get-event-by-id/:eventId")
  .get(verifyUserToken, getEventById);

eventRouter
  .route("/add-event")
  .post(multerUpload.single("thumbnail"), verifyUserToken, addEvent);

eventRouter
  .route("/delete-event/:eventId")
  .delete(verifyUserToken, deleteEvent);

eventRouter
  .route("/register-to-event/:eventId")
  .post(multerUpload.none(), verifyUserToken, eventRegister);

eventRouter
  .route("/deregister-from-event/:eventId")
  .post(multerUpload.none(), verifyUserToken, eventDeregister);

eventRouter
  .route("/update-event-details/:eventId")
  .patch(verifyUserToken, multerUpload.none(), updateEventDetails);

eventRouter
  .route("/update-event-thumbnail/:eventId")
  .patch(verifyUserToken, multerUpload.single("thumbnail"), updateEventThumbnail);

export default eventRouter;

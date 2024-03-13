// Values which are needed at several places in the codebase and do not change

const DB_NAME = "code_connect";

const API_VERSION = "api/v1";

const CLOUDINARY_CLOUD_NAME = "dmso2v4ec";

const INITIAL_ERROR_MESSAGES = {
  EVENTS: {
    GET_EVENTS: "Could not fetch events successfully",
    GET_EVENT_BY_ID: "Could not fetch event details successfully",
    CREATE_EVENT: "Could not create a new event",
    REGISTER_EVENT: "Could not register to the event",
    DELETE_EVENT: "Could not delete the event",
    DEREGISTER_EVENT: "Could not de-register from the event",
    UPDATE_EVENT_DETAILS: "Could not update event details successfully",
    UPDATE_EVENT_THUMBNAIL: "Could not update event thumbnail successfully",
  },
  USERS: {
    GET_LOGGED_IN_USER:
      "Logged-In User details could not be fetched successfully",
    REGISTER_USER: "User could not be registered successfully",
    LOGIN_USER: "User could not be logged in successfully",
    LOGOUT_USER: "User could not be logged out successfully",
    CHANGE_USER_PASSWORD: "User password could not be updated successfully",
    CHANGE_USER_DETAILS: "User details could not be updated successfully",
    GET_USER_REGISTERED_EVENTS:
      "Could not fetch user registered events successfully",
    GET_USER_HOSTED_EVENTS:
      "Could not fetch user hosted/created events successfully",
  },
};

export { DB_NAME, API_VERSION, CLOUDINARY_CLOUD_NAME, INITIAL_ERROR_MESSAGES };

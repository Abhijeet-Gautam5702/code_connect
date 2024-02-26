// Values which are needed at several places in the codebase and do not change

const DB_NAME = "code_connect";

const API_VERSION = "api/v1";

const CLOUDINARY_CLOUD_NAME = "dmso2v4ec";

const INITIAL_ERROR_MESSAGES = {
  EVENTS: {
    CREATE_EVENT: "Could not create a new event",
    REGISTER_EVENT: "Could not register to the event",
    DELETE_EVENT: "Could not delete the event",
    DEREGISTER_EVENT: "Could not de-register from the event",
  },
  USERS: {
    // Write the initial error message constants for all the user-controllers here
  },
};

export { DB_NAME, API_VERSION, CLOUDINARY_CLOUD_NAME, INITIAL_ERROR_MESSAGES };

/*
    WRAPPER FUNCTION
    AsyncHandler function wraps any callback function and returns an async function which
    - executes the callback, OR
    - sends an object response to the client in case of a sever-error

    NOTE: This wrapper function is specifially written to standardize structure of the controller methods and middlewares.
*/
const asyncHandler = (callbackFn) => {
  return async function (req, res, next) {
    try {
      await callbackFn(req, res, next);
    } catch (error) {
      res.status(error.statusCode || 500).json({
        message: error.message,
      });
      // throw err; // IMPORTANT:  The backend will stop forever once any error is found in any API-route
    }
  };
};

export default asyncHandler;

/*
    CUSTOM API-ERROR CLASS

    - Class to create a custom Error object, extending the built-in NodeJS Error class.
    - Will be used to throw errors in controllers and middlewares in a structured manner. 

*/
class customApiError extends Error {
  constructor(message, statusCode, errors = [],stack="") {
    /*
        super() method is called to invoke the constructor of the parent Error-class (which takes only the the message as parameter) and overwrite the message property
    */
    super(message); // message property is inherited from the parent Error-class
    this.statusCode = statusCode; //statusCode is exclusive property of customApiError
    this.errors = errors; //errors is exclusive property of customApiError
    this.data = null; //data is exclusive property of customApiError
    this.success = false; //success is exclusive property of customApiError
    if (stack) {
        this.stack = stack;
    } else {
        Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { customApiError };

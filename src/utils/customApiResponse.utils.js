/*
    CUSTOM API-RESPONSE CLASS

    - Class to create a custom API-Response object
    - Will be used in controllers and middlewares to send responses in a structured manner. 

*/
class customApiResponse {
  constructor(message, statusCode, data) {
    this.message = message;
    this.statusCode = statusCode;
    this.data = data;
    this.success = true;
  }
}

export { customApiResponse };

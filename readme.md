
# Code Connect Backend

This project includes backend API endpoints for a sophisticated event hosting platform where users can search for and register for technical events like hackathons and tech meetups in their area. Users can also create and host their own technical events. 

It is built using Node.js and Express for the backend, and MongoDB with Mongoose for the database. Additionally, it utilizes third-party services like Cloudinary for image and file uploads.

The code follows best practices for JavaScript and backend development, ensuring it is efficient and maintainable. It also incorporates advanced concepts such as MongoDB Aggregation Pipelines where necessary.

This backend code is designed to help beginner to intermediate developers create a fully-functional web application similar to existing event hosting platforms.

## Salient Features

This backend provides almost all the features that a complex and fully functioning video sharing platform consists. Below mentioned are a few of the many features of this project.

- Heavily commented code explaining each line of code
- Modular and structured code adhering to the industry best-practices
- Error-proof code using modern JS code principles like async-await and try-catch
- Seamless Image and File uploads (using Cloudinary and Multer)
- Secured Authentication (using JWTs)
- Authentication via browser cookies
- Password Hashing (using Bcrypt)
- Mongoose custom methods and middlewares
- MongoDB Aggregation Pipelines for complex database queries

## Installation and Testing

- Ensure that you have Node installed in your machine locally (if not, [install from here](https://nodejs.org/en)) by running the following command  

```bash
node
```

- Clone the repository by running the following command

```bash
git clone https://github.com/Abhijeet-Gautam5702/code_connect_backend.git
```

- Install the dependencies

```bash
npm install
```

- Create your own MongoDB instance from the [official website](https://www.mongodb.com/).

- Taking the `.env.example` file as reference, create a new `.env` file in the root directory and populate it with required sensitive information like API-Keys, JWT-secrets etc.

- Use [Postman](https://web.postman.co/) (recommended) or any other API-testing tool to test the endpoints.

## Dependencies and Packages

- [NodeJS](https://nodejs.org/en)
- [ExpressJS](https://expressjs.com/)
- [JWT (JSON Web Tokens)](https://www.npmjs.com/package/jsonwebtoken)
- [MongoDB](https://www.mongodb.com/)
- [Mongoose](https://mongoosejs.com/)
- [Multer](https://www.npmjs.com/package/multer)
- [Bcrypt](https://www.npmjs.com/package/bcrypt)
- [Cloudinary](https://cloudinary.com/)
- [Dotenv](https://www.npmjs.com/package/dotenv)
- [Cors](https://www.npmjs.com/package/cors)
- [Cookie Parser](https://www.npmjs.com/package/cookie-parser)
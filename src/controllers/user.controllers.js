import asyncHandler from "../utils/asyncHandler.js";

/*
    USER REGISTRATION CONTROLLER

    -
*/
const userRegister = asyncHandler((req, res) => {
  res.json({
    message: "User Registered",
  });
});

/*
    USER LOGIN CONTROLLER

    - 
*/
const userLogin = asyncHandler((req,res)=>{
    res.json({
        message:"User Logged In"
    })
})


export { userRegister,userLogin };

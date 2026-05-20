const express=require('express')
const {
  verifyFirebaseToken,
} = require('../../middlewares/auth.middleware')
const {
  registerUser,
  loginUser,
  loginWithGoogle,
  requestPasswordReset,
  resetPassword,
  logoutUser,
  authMiddleware,
}= require('../../controllers/auth/auth-controller')
const router=express.Router();

router.post('/register',registerUser);
router.post('/login',loginUser);
router.post('/google',loginWithGoogle);
router.post('/forgot-password',requestPasswordReset);
router.post('/reset-password',resetPassword);
router.post('/logout',logoutUser)
router.get('/check-auth',authMiddleware,(req,res)=>{
    const user=req.user;
    res.status(200).json({
        success: true,
        message:'Authenticated User!',
        user
    });
});
router.get('/check-firebase-auth',verifyFirebaseToken,(req,res)=>{
    res.status(200).json({
        success: true,
        message:'Authenticated Firebase user!',
        user: req.user
    });
});

module.exports=router;

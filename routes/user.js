const express=require('express');
const router= express.Router();
const {requireSignin,isAdmin,isAuth}=require('../controllers/auth');

const {userById,read,update}=require('../controllers/user');

router.get('/secret/:userId',requireSignin,isAuth,isAdmin,(req,res)=>{
    console.log(req.profile)
    res.json({
        user:req.profile
    });
});
router.param('userId',userById);
router.get('/user/:userId',requireSignin,isAuth,read);
router.put('/user/:userId',requireSignin,isAuth,update);
module.exports=router;
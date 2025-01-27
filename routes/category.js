const express=require('express');
const router= express.Router();
const {requireSignin,isAdmin,isAuth}=require('../controllers/auth');
const {userById}=require('../controllers/user');

const {create,categoryById,read,update,remove,list}=require('../controllers/category');


router.post('/category/create/:userId',requireSignin,isAdmin,isAuth,create)
router.put('/category/:categoryId/:userId',requireSignin,isAdmin,isAuth,update)
router.delete('/category/:categoryId/:userId',requireSignin,isAdmin,isAuth,remove)
router.get('/category/:categoryId',read)
router.get('/categories',list)


router.param('userId',userById);
router.param('categoryId',categoryById);
module.exports=router;
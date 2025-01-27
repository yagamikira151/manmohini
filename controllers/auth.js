const User=require('../models/user');
const jwt =require('jsonwebtoken');// to generate signed token
const expressJwt=require('express-jwt'); //authorisation check
const {errorHandler}=require('../helpers/dberrorhandler');

exports.signup=(req,res)=>{
    // console.log(req.body)
    const user=new User(req.body)
    user.save((err,user)=>{
        if(err){
            return res.status(400).json({
                error:errorHandler(err)
            })
        }
        user.salt=undefined;
        user.hashed_password=undefined;
        res.json({
            user
        });
    });
};
exports.signin=(req,res)=>{
    const {email,password}=req.body;
    User.findOne({email},(err,user)=>{
        if(err||!user){
            return res.status(400).json({
                error: 'User with that email doesnot exist'
            });
        }
        if(!user.authenticate(password)){
            return res.status(401).json({
                error:'Email and password doesnt matched'
            })
        }
        // if user is find make sure the email and password match
        const token =jwt.sign({id:user._id},process.env.JWT_SECRET)
        // persist the token as 't in cookie with expiry date
        res.cookie('t',token,{expire:new Date()+9999});
        // return response with user and token to frontend client
        const {_id,name,email,role}=user
        return res.json({token,user:{_id,email,name,role}});
    })
};
exports.signout=(req,res)=>{
   res.clearCookie("t");
   res.json({message:"successfully logout"});
};

exports.requireSignin = expressJwt({
    secret:process.env.JWT_SECRET,
    userProperty:"auth",
    algorithms: ['HS256']
});

exports.isAuth=(req,res,next)=>{
    console.log(req.profile._id,req.auth.id);
    let user=req.profile&&req.auth&&req.profile._id==req.auth.id;
    console.log(user)
    if(!user){
        return res.status(403).json({
            error:"Access denied"
        })
    }
    next();
};

exports.isAdmin=(req,res,next)=>{
    if(req.profile.role===0){
        return res.status(403).json({
            error:"Admin resource! access denied"
        });
    }
    next();
}
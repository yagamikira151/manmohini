const User = require('../models/user');

exports.userById= (req,res,next,id)=>{
    User.findById(id).exec((err,user)=>{
        if(err||!user){
            return res.status(400).json({
                error: 'User not found'
            });
        }
        req.profile=user;
        next();
    });
};

exports.read=(req,res)=>{
    req.profile.hashed_password=undefined;
    req.profile.salt=undefined;
    return res.json(req.profile);
}
exports.update=(req,res)=>{
    console.log("p");
    User.findOneAndUpdate({_id:req.profile._id},{$set:req.body},{new:true},(err,user)=>{
        if(err){
            res.status(400).json({
                error:"You are not authorised of this action"
            })
        }
        user.hashed_password=undefined;
        user.salt=undefined;
        res.json(user);
    })
}
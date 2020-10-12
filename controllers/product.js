const formidable= require('formidable');
const _ =require('lodash');
const fs=require('fs');
const Product= require('../models/product');
const { errorHandler } = require('../helpers/dberrorhandler');
const product = require('../models/product');
const category = require('../models/category');



exports.productById=(req,res,next,id)=>{
    Product.findById(id).exec((err,product)=>{
        if(err||!product){
            return res.status(400).json({
                error:'Product could not be Found!'
            })
        }
        req.product=product
        next();
    })
}

exports.create=(req,res)=>{
    let form=new formidable.IncomingForm();
    form.keepExtensions=true;
    form.parse(req,(err,fields,files)=>{
        if(err){
            return res.status(400).json({
                error:'Image could not be uploaded'
            })
        }
        let product= new Product(fields)

        // check for all  fields
        const {name,description,price,category,quantity,shipping}=fields
        if(!name||!description||!price||!category||!quantity||!shipping){
            return res.status(400).json({
                error:'Some of the fields are empty'
            })
        }
        if(!files.photo){
            return res.status(400).json({
                error:'Please upload an Image'
            })
        }
        if(files.photo){
            if(files.photo.size>1000000){
                return res.status(400).json({
                    error:'Image should be less than 1MB'
                })
            }
            product.photo.data=fs.readFileSync(files.photo.path)
            product.photo.contentType=files.photo.type
        }
        product.save((err1,result)=>{
            if(err1){
                console.log(err1);
                return res.status(400).json({
                    error:errorHandler(err1)
                })
            }
            res.json(result);
        });
    });
};

exports.read=(req,res)=>{
    req.product.photo=undefined
     return res.json(req.product)
}

exports.remove=(req,res)=>{
    let product=req.product
    product.remove((err,deletedProduct)=>{
        if(err){
            return res.status(400).json({
                error:errorHandler(err)
            })
        }
        res.json({
            message:"Product is successfully deleted"
        });
    });
};

exports.update=(req,res)=>{
    let form=new formidable.IncomingForm();
    form.keepExtensions=true;
    form.parse(req,(err,fields,files)=>{
        if(err){
            return res.status(400).json({
                error:'Image could not be uploaded'
            })
        }
        let product= req.product
        product=_.extend(product,fields)
        // check for all  fields
        const {name,description,price,category,quantity,shipping}=fields
        if(!name||!description||!price||!category||!quantity||!shipping){
            return res.status(400).json({
                error:'Some of the fields are empty'
            })
        }
        if(!files.photo){
            return res.status(400).json({
                error:'Please upload an Image'
            })
        }
        if(files.photo){
            if(files.photo.size>1000000){
                return res.status(400).json({
                    error:'Image should be less than 1MB'
                })
            }
            product.photo.data=fs.readFileSync(files.photo.path)
            product.photo.contentType=files.photo.type
        }
        product.save((err1,result)=>{
            if(err1){
                console.log(err1);
                return res.status(400).json({
                    error:errorHandler(err1)
                })
            }
            res.json(result);
        });
    });
}

exports.list=(req,res)=>{
    let order =req.query.order?req.query.order:'asc'
    let sortBy =req.query.sortBy?req.query.sortBy:'_id'
    let limit =req.query.limit?parseInt(req.query.limit):100
    product.find()
        .select("-photo")
        .populate('category')
        .sort([[sortBy,order]])
        .limit(limit)
        .exec((err,products)=>{
            if(err){
                return res.status(400).json({
                    error:"Product not found"
                })
            }
            res.json(products)
        })
}

exports.listRelated=(req,res)=>{
    let limit=req.query.limit?parseInt(req.query.limit):100
    Product.find({_id:{$ne:req.product},category:req.product.category})
    .limit(limit)
    .select("-photo")
    .populate('category','_id name')
    .exec((err,products)=>{
        if(err){
            return res.status(400).json({
                error:"Product not found"
            })
        }
        res.json(products)
    })
}

exports.listCategories=(req,res)=>{
    Product.distinct("category",{},(err,categories)=>{
        if(err){
            return res.status(400).json({
                error:"Product not found"
            })
        }
        res.json(categories)
    })
}
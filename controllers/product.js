const formidable= require('formidable');
const _ =require('lodash');
const fs=require('fs');
const Product= require('../models/product');
const { errorHandler } = require('../helpers/dberrorhandler');
const product = require('../models/product');
const category = require('../models/category');



exports.productById=(req,res,next,id)=>{
    Product.findById(id)
    .populate("category")
    .exec((err,product)=>{
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
            // console.log(name,description,price,category,quantity,shipping);
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
        // const {name,description,price,category,quantity,shipping}=fields
        // if(!name||!description||!price||!category||!quantity||!shipping){
        //     return res.status(400).json({
        //         error:'Some of the fields are empty'
        //     })
        // }
        // if(!files.photo){
        //     return res.status(400).json({
        //         error:'Please upload an Image'
        //     })
        // }
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
    let limit=req.body.limit?parseInt(req.body.limit):100
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
                error:"category not found"
            })
        }
        res.json(categories)
    })
}

exports.listBySearch=(req,res)=>{
    let order =req.body.order?req.body.order:'desc'
    let sortBy =req.body.sortBy?req.body.sortBy:'_id'
    let limit =req.body.limit?parseInt(req.body.limit):100;
    let skip=parseInt(req.body.skip);
    let findAgrs={};
    console.log(order,sortBy,limit,skip);
    for(let key in req.body.filters){
        if(req.body.filters[key].length>0){
            if(key==="price"){
                findAgrs[key]={
                    $gte:req.body.filters[key][0],
                    $lte:req.body.filters[key][1]
                };
            }else{
                findAgrs[key]=req.body.filters[key];
            }
        }
    }

    Product.find(findAgrs)
        .select("-photo")
        .populate("category")
        .sort([[sortBy,order]])
        .skip(skip)
        .limit(limit)
        .exec((err,data)=>{
            if(err){
                return res.status(400).json({
                    error:"Product not found"
                })
            }
            res.json({
                size:data.length,
                data
            });
        });
    
};

exports.photo=(req,res,next)=>{
    if(req.product.photo.data){
        res.set('Content-Type',req.product.photo.contentType)
        return res.send(req.product.photo.data)
    }
    next();
}


exports.listSearch=(req,res)=>{
    const query={}
    if(req.query.search){
        query.name={$regex:req.query.search,$options:'i'}
        if(req.query.category&&req.query.category!='All'){
            query.category=req.query.category;
        }
        Product.find(query,(err,products)=>{
            if(err){
                return res.status(400).json({
                    error:errorHandler(err)
                })
            }
            res.json(products)
        }).select('-photo')
    }
}
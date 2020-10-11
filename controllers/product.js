const formidable= require('formidable');
const _ =require('lodash');
const fs=require('fs');
const Product= require('../models/product');
const { errorHandler } = require('../helpers/dberrorhandler');

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
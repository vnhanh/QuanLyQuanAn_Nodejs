const User = require('../models/user');// Import User Model Schema
const jwt =require('jsonwebtoken'); // Các phương tiện đại diện cho các yêu cầu được chuyển giao giữa hai bên hợp lý, an toàn với URL.
const CategoryFood =require('../models/categoryFood');// Import Blog Model Schema
const config =require('../config/database');// Import cấu hình database 
const Food =require('../models/foods');
module.exports =(router,io)=>{

    // tạo một Category_food  mới 
    router.post('/createCategoryFood',(req, res)=>{
        if(!req.body.id){
            res.json({success: false, message: 'Chưa nhập mã danh mục!'});
        }else{
            if(!req.body.name){
                res.json({success: false, message: 'Chưa nhập tên danh mục!'});
            }else{
                const categoryFood = new CategoryFood({
                    id: req.body.id,
                    name: req.body.name
                });
                categoryFood.save((err)=>{
                    if(err){
                        if(err.code===11000)
                        {
                            res.json({success:false, message: 'Mã hoặc tên danh mục bị trùng!'});
                        }else{
                            if(err.errors){
                                if(err.errors.id){
                                    res.json({success:false, message: err.errors.id.message});
                                }else{
                                    if(err.errors.name){
                                        res.json({success: false, message: err.errors.name.message});
                                    }else{
                                            res.json({success :false, message:err.errmsg});
                                        
                                    }
                                }
                            }else{
                                res.json({success :false, message:er});
                            }
                        }
                        
                    }else{
                        res.json({success: true, message: 'Đã lưu danh mục!'});
                        io.sockets.emit("server-add-categoryFood", {categoryFood:categoryFood});
                    }
                })
            }
        }
    });
    

    router.get('/checkIdCategory/:id', (req, res)=>{
        if(!req.params.id){
            res.json({success: false, message: 'Chưa nhập mã danh mục!'});
        }else{
            CategoryFood.findOne({id: req.params.id}, (err, categoryFood)=>{
                if(err){
                    res.json({success:false, message:err});
                }else{
                    if(categoryFood){
                        res.json({success:false, message: 'Mã này đã được sử dụng!'});
                    }else{
                        res.json({success:true, message:'Mã này hợp lệ.'});
                    }
                }
            });
        }
    });
    router.get('/checkNameCategory/:name', (req, res)=>{
        if(!req.params.name){
            res.json({success: false, message: 'Chưa nhập tên danh mục!'});
        }else{
            CategoryFood.findOne({name: req.params.name}, (err, categoryFood)=>{
                if(err){
                    res.json({success:false, message:err});
                }else{
                    if(categoryFood){
                        res.json({success:false, message: 'Tên này đã được sử dụng!'});
                    }else{
                        res.json({success:true, message:'Tên này hợp lệ.'});
                    }
                }
            });
        }
    });
    
    router.get('/allCategoryFoods', (req, res) => {
        // Search database for all blog posts
        CategoryFood.find({}, (err, categoryfoods) => {
          // Check if error was found or not
          if (err) {
            res.json({ success: false, message: err }); // Return error message
          } else {
            // Check if blogs were found in database
            if (!categoryfoods) {
              res.json({ success: false, message: 'Không tìm thấy danh mục nào.' }); // Return error of no blogs found
            } else {
              res.json({ success: true, categoryfoods: categoryfoods }); // Return success and blogs array
            }
          }
        }).sort({ '_id': -1 }); // Sort blogs from newest to oldest
      });

      router.delete('/deleteCategoryFood/:id', (req, res) => {
        if (!req.params.id) {
          res.json({ success: false, message: 'Chưa cung cấp mã danh mục' }); 
        } else {
          CategoryFood.findOne({ id: req.params.id }, (err, categoryFood) => {
            if (err) {
              res.json({ success: false, message:err }); 
            } else {
              if (!categoryFood) {
                res.json({ success: false, messasge: 'Không tìm thấy danh mục' }); // Return error message
              } else {
                Food.findOne({category_id: req.params.id},(err, food)=>{
                    if(err){
                        res.json({success: false, message:err})
                    }else{
                        if(food){
                            res.json({success: false, message:'Không thể xóa! Danh mục có chứa món ăn.'});
                        }else{
                            categoryFood.remove((err) => {
                                if (err) {
                                res.json({ success: false, message: err }); // Return error message
                                } else {
                                    res.json({ success: true, message: 'Danh mục đã được xóa.' }); // Return success message
                                    io.sockets.emit("server-delete-categoryFood", {id: req.params.id});
                                }
                            });
                        }
                    }
                })
              }
            }
                    
            })
        }
      });

      router.put('/updateCategoryFood', (req, res) => {
        if (!req.body.id) {
          res.json({ success: false, message: 'Chưa cung cấp mã danh mục' }); 
        } else {
          CategoryFood.findOne({ id: req.body.id }, (err, categoryFood) => {
            if (err) {
              res.json({ success: false, message: 'Không đúng mã danh mục' }); // Return error message
            } else {
              if (!categoryFood) {
                res.json({ success: false, message: 'Không tìm thấy danh mục.' }); // Return error message
              } else {
                categoryFood.name = req.body.name; // Save latest blog title
                categoryFood.save((err) => {
                          if (err) {
                            if (err.errors) {
                              res.json({ success: false, message: 'Thông tin cần chính xác.' });
                            } else {
                              res.json({ success: false, message: err }); // Return error message
                            }
                          } else {
                            res.json({ success: true, message: 'Danh mục dã được cập nhật!' }); // Return success message
                            io.sockets.emit("server-update-categoryFood", {categoryFood:categoryFood});
                        }
                    });
                }
              }
          });
        }
      });

    return router;
};

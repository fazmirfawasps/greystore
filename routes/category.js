var express = require('express');
const categoryHelpers = require('../helpers/categoryHelpers');
var router = express.Router();


router.get('/',(req,res)=>{
    console.log("heloo")
 categoryHelpers.getallCategoryDetails().then((category)=>{
    console.log('fucked')
    console.log(category)
    res.render('admin/category',{category})

 })

  
    
})




router.get('/add',(req,res)=>{
    console.log('hello')

 res.render('admin/addcategory',{invalid:req.session.categorystatus})
 req.session.categorystatus=""

})

router.post('/add',(req,res)=>{
    console.log(req.body)
    categoryHelpers.addcategory(req.body).then((response)=>{
        if(response.status){
            req.session.categorystatus=" alreadyexist"
       res.redirect('/category/add')
        }
        else {
            res.redirect('/category')

        }
    })

})
router.get('/delete',(req,res)=>{
    categoryHelpers.deleteCategory(req.query.id).then(()=>{
        console.log('fucked')
        res.redirect('/category')
    })

    console.log(req.query.id)

   
})
router.get('/edit',(req,res)=>{
    console.log('pettillaaa')
    console.log(req.query.id)
    res.render('admin/editcategory',{id:req.query.id})
})

router.post('/edit',(req,res)=>{
    console.log(req.query.id)
    console.log(req.body.category)
    categoryHelpers.updateCategory(req.query.id,req.body.category).then((response)=>{
        console.log(response)
        res.redirect('/category')
    })

})













module.exports = router;
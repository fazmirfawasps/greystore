var express = require('express');
var router = express.Router();

router.get('/',(req,res)=>{
    res.render('dashboard/index')
    console.log('pettu')
})





module.exports = router;
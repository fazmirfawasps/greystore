var express = require('express');
const adminHelpers = require('../helpers/adminHelpers');
const categoryHelpers = require('../helpers/categoryHelpers');
const orderHelper = require('../helpers/orderHelper');
var couponHelpers = require('../helpers/couponHelpers')
var router = express.Router();

var bannerHelpers = require('../helpers/bannerHelper')
var productHelpers = require("../helpers/productHelpers")
var upload = require('../middleware/multer');
const { route } = require('./users');
const { response } = require('express');
const wallet = require('../helpers/wallet');
const { verify } = require('../helpers/paypal');
/* GET home page. */

function verifyLogin(req, res, next) {
  if (req.session.admin) {
    next()
  }
  else {
    res.redirect('/admin')
  }
}
router.get('/', verifyLogin, function (req, res) {
  productHelpers.getallproducts().then((productsDout) => {



    console.log('work aavand')
    let products = productsDout
    res.render('admin/adminpanels', { products })



  })
    ;
});

router.get('/admin/addproducts', function (req, res) {
  categoryHelpers.getallCategoryDetails().then((category) => {
    console.log(category)
    res.render('admin/addproducts', { category });
  })


})
router.post('/admin/addproducts', upload.array('image', 5), (req, res, next) => {
  console.log("hello")
  console.log(req.body)
  console.log('fuckuuuuuu')
  const filesname = req.files.map(filename);
  function filename(file) {
    return file.filename;
  }

  console.log(filesname)
  let proDetails = req.body
  proDetails.imageFile = filesname
  proDetails.multImg = true

  productHelpers.addproducts(proDetails, (id) => {

    res.redirect('/')

  })



})
router.get('/admin/delete', function (req, res) {
  console.log("working")
  console.log(req.query.id)
  let proId = req.query.id
  productHelpers.deleteproduct(proId).then((response) => {
    res.redirect("/")

  })


})
router.get('/admin/edit', async function (req, res) {
  let proId = req.query.id
  console.log(req.query.id)
  let product = await productHelpers.getproductDetails(proId)
  categoryHelpers.getallCategoryDetails().then((category) => {
    console.log(product)
    console.log(category)
    res.render('admin/editproducts', { product, category })

  })



}
)
router.post('/admin/edit', function (req, res) {
  console.log('wooo')
  console.log(req.query.id)
  let id = req.query.id
  console.log(req.body)


  console.log('ivdyaan petteeee')
  productHelpers.editproduct(req.query.id, req.body).then((response) => {
    res.redirect('/')

  })



})
router.get('/edit', async (req, res) => {
  console.log('ivde thott')
  let proId = req.query.id
  console.log(req.query.id)
  let product = await productHelpers.getproductDetails(proId)
  categoryHelpers.getallCategoryDetails().then((category) => {
    console.log(product)
    console.log(category)

    let a = product._id
    console.log(a)
    let b = product
    console.log(b)
    res.render('admin/productEdit', { product, category })

  })
})

router.post('/edit', upload.array('image', 5), async (req, res) => {
  console.log('messi')
  console.log(req.files)
  const filesname = req.files.map(filename);
  function filename(file) {
    return file.filename;
  }
  let product = await productHelpers.getproductDetails(req.query.id)
  console.log(product)

  // console.log(filesname)
  console.log(req.body)
  let proDetails = req.body
  proDetails.imageFile = filesname
  proDetails.multImg = true
  for (i = 0; i < product.imageFile.length; i++) {
    if (product.imageFile[i] == req.body.pic1) {
      console.log('patti shoe')
    

    }
   else if (product.imageFile[i] == req.body.pic2) {
      console.log('pa shoe')

    }
    else if(product.imageFile[i] == req.body.pic3){
      console.log('oooas')

    }
    else{
      proDetails.imageFile.push(product.imageFile[i])
    }
  }
  console.log( proDetails.imageFile)


  // console.log(req.body)
  // console.log(req.query.id)
  console.log('ivdyaan petteeee')
  productHelpers.editproduct(req.query.id,proDetails).then((response)=>{
   res.redirect('/')

  })
})


router.get('/admin', function (req, res) {


  res.render('admin/adminLogin', { errMSG: req.session.adminInvalid })
  req.session.adminInvalid = null
})

let username = "fazmir"
let password = "4640"

router.post('/admin', function (req, res) {
  console.log("working")
  console.log(req.body)
  console.log(req.body.username)
  if (req.body.username == username && req.body.password == password) {
    req.session.admin = true
    res.redirect('/home')

  }
  else {
    console.log('not working')
    req.session.adminInvalid = "invalid User Name or Password"
    res.redirect('/admin')
  }


})



// view customers in admin
router.get('/customers', verifyLogin, (req, res) => {
  console.log("fook")

  adminHelpers.viewCustomers().then((customers) => {
    console.log(customers)

    // var block=req.session.block
    res.render('admin/viewcustomers', { customers })
    console.log('fooked')

  })


})

// block and unblock

router.get('/unblock', (req, res) => {
  console.log(req.query.id)
  adminHelpers.unBlockCustomers(req.query.id).then((response) => {
    console.log(response)
    console.log("what a man u are")

    res.redirect('/customers')

  })
})
router.get('/block', (req, res) => {
  console.log('pettumone')


  console.log(req.query.id)
  adminHelpers.blockCustomers(req.query.id).then((response) => {
    console.log(response)


    res.redirect("/customers")
  })

})

// ********homePAGE*****
router.get('/home', verifyLogin, (req, res) => {
  adminHelpers.chart().then((response) => {
    console.log(response)
    let value = response.map(function (response) {
      return response.Total
    })
    console.log(value)
    var ab = value[0]
    var bc = value[1]
    res.render('admin/grphandpie')


  })
})

// ********ADMIN LOGOUT*********

router.get('/logout', (req, res) => {
  req.session.admin = false
  res.redirect('/admin')

})


// **********ADMINorder******
router.get('/orders', verifyLogin, async (req, res) => {

  let orders = await orderHelper.adminorderlist()
  // for(i=0;i<orders.length;i++){
  //   if(orders[i].status=='Order Placed'){
  //     orders[i].pa=true
  //     orders[i].Now=true

  //   }
  //   else if(orders[i].status=='packed'){
  //     orders[i].sh=true
  //     orders[i].Now=true
  //   }
  //   else if(orders[i].status=='shipped'){
  //      orders[i].de=true
  //      orders[i].Now=true
  //   }
  //   else if(orders[i].status=='delivered'){
  //     orders[i].de=true
  //     orders[i].Now=false

  //   }
  //   else{
  //     orders[i].Now=false
  //   }

  //  }



  res.render('admin/adminOrder', { orders })

})

// ********cancel order******\
router.get('/cancelOrder', (req, res) => {
  console.log(req.query.id)

  orderHelper.cancelorder(req.query.id).then(() => {

    res.redirect('/orders')
  })



})

router.get('/ajax', (req, res) => {
  console.log('fuclkes')
  res.render('admin/ajax')
})

router.get('/pie', (req, res) => {
  console.log('ooombi')
  adminHelpers.chart().then(async (reponse) => {
    let line = await adminHelpers.amount()
    let category = await adminHelpers.categorychart()
    console.log(category)
    let value = reponse.map(function (reponse) {
      return reponse.Total
    })

    response.status = reponse
    response.payline = line

    res.json(response)
  })
})

router.get('/piechart', (req, res) => {
  console.log('fuuk')
  adminHelpers.getYearly().then((response) => {

    console.log(response)
    res.render('admin/pie')


  })
})

router.get('/line', (req, res) => {
  console.log('hhooon')
  adminHelpers.getYearly().then((response) => {
    console.log(response)
    let value = response.map(function (response) {
      return response.Total
    })
    console.log(value)
    res.json({ value })
  })
})

// ***********Daily Report***********
router.get('/dailyReport', (req, res) => {
  adminHelpers.dailysale().then((response) => {
    res.render('admin/dailyReport', { response })

  })


})

router.get('/weeklyReport', (req, res) => {
  console.log('fucked')
  adminHelpers.weeklySale().then((response) => {
    console.log('irngi')

    res.render('admin/weeklyReport', { response })

  })

})



router.post('/deliveryStatus', async (req, res) => {

  console.log('pettilllaaaa')
  console.log(req.body)

  if (req.body.change == 'Approved return') {

    console.log(req.body.change)
    console.log(req.body)
    let srs = await wallet.getRefund(req.body.user, req.body.total)

  }

  // orderHelper.changeStatus(req.body.order,req.body.change).then(()=>{
  orderHelper.statuschange(req.body).then(() => {
    console.log('workAyi')
    res.json({ status: true })
  })


  // })
})

router.get('/coupon', verifyLogin, async (req, res) => {



  couponHelpers.findCoupon().then((response) => {

    console.log(response)

    res.render('admin/coupon', { response })


  }).catch((MSG) => {
    console.log(MSG);
  })





})


router.get('/addCoupon', (req, res) => {

  res.render('admin/addCoupon')
})

router.post('/addCoupon', (req, res) => {
  console.log('PETTU')
  console.log(req.body)
  couponHelpers.addCoupon(req.body).then(() => {

    res.redirect('/coupon')
  })

})
// ***************editcoupon******************
router.get('/editCoupon', (req, res) => {
  console.log(req.query.id)
  couponHelpers.findacoupon(req.query.id).then((response) => {
    res.render('admin/editCoupon', { coupon: response })

  })

})

router.post('/editCoupon', (req, res) => {
  console.log('petttu')
  console.log(req.body)
  couponHelpers.update(req.body).then(() => {
    res.redirect('/coupon')
  })

})


// ***************delete coupon****************

router.get('/couponDelete', (req, res) => {
  console.log('pettilaa')

  couponHelpers.deleteCoupon(req.query.id).then((response) => {

    res.redirect('/coupon')
  })


})

router.get('/viewSingleproduct', (req, res) => {
  console.log(req.query.id)
  adminHelpers.viewSingeleproduct(req.query.id).then((product) => {
    product.forEach((element) => {
      if (element.SPstatus == "Requested Return") {
        element.return = true;
      } else if (
        element.SPstatus == "Return Rejected" ||
        element.SPstatus == "Approved return" ||
        element.SPstatus == "Delivered" ||
        element.SPstatus == "Order Cancelled"

      ) {
        element.none = true;
      }
      else if (element.SPstatus == "Dispatched"
      ) { element.dis = true }

    });
    res.render('admin/viewSingleproduct', { product })



  })


})

router.get('/graphpie', (req, res) => {

  res.render('admin/graph')
})

router.get('/deletebanner', (req, res) => {
  bannerHelpers.deleteBanner(req.query.id).then(() => {
    res.redirect('/banner')
  })
})

router.get('/my', (req, res) => {

  adminHelpers.chart().then((response) => {
    console.log(response)
    let value = response.map(function (response) {
      return response.Total
    })
    console.log(value)
    var ab = value[0]
    var bc = value[1]
    res.render('admin/grphandpie', { value })


  })
})

router.get('/modal', (req, res) => {
  res.render('admin/modal')
})

router.get('/banner', verifyLogin, (req, res) => {

  bannerHelpers.getBanner().then((banner) => {
    console.log(banner)
    res.render('admin/banner', { banner })

  })
})

router.post('/banner', upload.array('image', 1), (req, res) => {
  console.log(req.files[0].filename)
  let banner = req.body
  banner.image = req.files[0].filename
  banner.status = true
  bannerHelpers.addBanner(banner).then(() => {
    console.log('fawas')
    res.redirect('/banner')
  })

})

router.get('/editbanner', (req, res) => {

  res.render('admin/editbanner')
})

router.post('/bannerstatus', (req, res) => {

  console.log(req.body)
  bannerHelpers.changeBannerStatus(req.body).then(() => {
    res.json({ status: true })
  })
})


router.get('/salesReport', verifyLogin, (req, res) => {


  res.render('admin/salesReport')

})

router.get('/fromto', (req, res) => {
  console.log(req.query)
  adminHelpers.fromTo(req.query).then((Data) => {
    date = req.query
    console.log(Data)
    res.render('admin/salesReport', { Data, date })

  })
})

router.get('/monthly', (req, res) => {
  console.log(req.query)
  let cdate = req.query;
  let vals = cdate.month.split("-");
  let dates = {
    month: vals[1],
    year: vals[0],
  };
  adminHelpers.getSalesByMonth(dates).then((Data) => {
    console.log(Data)
    res.render("admin/adminMontly", { Data, cdate });
  });

})
router.get("/salesyearly", (req, res) => {
  const month = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  let cyear = req.query;
  adminHelpers.getSalesByyear(cyear).then((Data) => {
    Data.forEach((element) => {
      element._id = month[element._id - 1];
    });
    console.log(Data)
    res.render("admin/adminMontly", { Data, cyear });
  });
});

module.exports = router
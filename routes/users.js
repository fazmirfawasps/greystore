var express = require('express');
const productHelpers = require('../helpers/productHelpers');
const userHelpers = require('../helpers/userHelpers');
var router = express.Router();
// var config=require('../config/twilio');
const { doLogin, findAddress } = require('../helpers/userHelpers');
const e = require('express');
const categoryHelpers = require('../helpers/categoryHelpers');

require('dotenv').config()

var client=require('twilio')(process.env.twilio_accountSID, process.env.twilio_authToken)
var cartHelpers=require('../helpers/cartHelpers');
const orderHelper = require('../helpers/orderHelper');
// const paypal=require('../helpers/paypal')
var pay=require('../helpers/paypal');
const couponHelpers = require('../helpers/couponHelpers');
const { response, Router } = require('express');
const wallet =require('../helpers/wallet');
const { order } = require('paypal-rest-sdk');
const adminHelpers = require('../helpers/adminHelpers');
const wishlistHelpers=require('../helpers/wishlist');
const wishlist = require('../helpers/wishlist');
/* GET users listing. */
// shop view*****
router.get('/',  lastroute ,async function(req, res, next) {
  console.log('nthaa smabavm')
  if(req.session.userLogIn){
  let Pcount=await cartHelpers.cartCount(req.session.userId)
  console.log(Pcount)
  console.log(Pcount.length)
  if(Pcount.length>0){
    req.session.count=Pcount[0].totalcount

  }
  else{
    req.session.count=0
    console.log( req.session.count)
  }

}
else{
console.log('guest illa')
}
productHelpers.getallproducts().then((products)=>{
  res.render('user/index',{products,user:req.session.user,count:req.session.count})
  console.log(req.session.userId)
})

  

});


// ***********SIGNUP**********
router.get('/signup',function(req,res){

  console.log("working")
  res.render('user/userSignup',{errorMessage:req.session.emailUsed})
  req.session.emailUsed=false
})
router.post('/signup',(req,res)=>{
  console.log("signup")
  console.log(req.body)
  userHelpers.userDetails(req.body).then((response)=>{
    if(response.email==req.body.email){
      req.session.emailUsed="Email Already Exists";
      res.redirect('/users/signup')
    }
    else if(response.phone==req.body.phone){
      req.session.emailUsed="mobno already exists"
      res.redirect('/users/signup')


    }
    else{
      res.redirect('/users/login');
    }
    console.log('working')
  })
})

// **********verifyLogin*****

function verifyLogin(req,res,next){
  if(req.session.userLogIn){
    next()
  }
  else{
    req.session.lastroute=req.originalUrl
    res.redirect('/users/login')
  }


}

function lastroute(req,res,next){
  req.session.lastroute=req.originalUrl
  next()
}

function cartcount(req,res,next){
  if(!req.session.count==0){
    next()
  }
  else{
    res.redirect('/users/cart')
  }

}

function commonroute(req,res,next){
  req.session.lastroute='/users'
  next()
}




// *********login************///

router.get('/login',function(req,res){
  console.log('login')
  
  res.render('user/userLogin',{errorMessage:req.session.invalid})

    req.session.invalid=''
})
router.post('/login',(req,res)=>{
  console.log(req.body)
  console.log(req.body.email)
  userHelpers.doLogin(req.body).then((response)=>{
  if(response.status){
    console.log(response)
    console.log(response.user)
    req.session.userLogIn=true;
    req.session.user=response.user;
    console.log(req.session.user)
    console.log(response.user._id)
    req.session.userId=response.user._id
    console.log(req.session.userId)
    console.log('fuckedup')
    console.log('laliga')
    if(req.session.lastroute){
      res.redirect(req.session.lastroute)

    }
    else{
      res.redirect('/users')
    }
  }
  else if(response.block){
    req.session.invalid="You Have been Blocked By admin";
      res.redirect('/users/login');

  }
  else{
    req.session.invalid="Invalid Password or Email";
    res.redirect('/users/login')
  }

  })
})


// otp ..........*****

router.get('/otp',function(req,res){
  res.render('user/otplogin',{errorMessage:req.session.invalidnum})
  req.session.invalidnum=false
  
  console.log('fuckedd')
  console.log('hi')
 
})
router.post('/otp',(req,res)=>{
  console.log(process.env.twilio_serviceID)
  userHelpers.dootp(req.body.phone).then((response)=>{
  
   if(response){

    if(!response.block){
      req.session.phoneNo=req.body.phone

      console.log(req.body.phone)
      
      client
      .verify
      .services(process.env.twilio_serviceID)
      .verifications
      .create({
        to:`+91${req.body.phone}`,
        channel:"sms"
    }).then((data)=>{
    
    
      console.log(data)
      console.log(data.to)

      req.session.user=response
      req.session.userId=response._id
      req.session.userLogIn=true
    
      req.session.phone=data.to
      res.redirect('/users/otpconfirm')
      console.log('eedeee')
      console.log('faz')
    
    })
  }
    else if(response.block){
      req.session.invalidnum="MobileNO is blocked"
      res.redirect('/users/otp')
    }
    
}
else{
  req.session.invalidnum="MobileNO is invalid"
  res.redirect('/users/otp')
}


  })

    
  
 

})

// *********RESEND oTP*******

router.get('/resendOTP',(req,res)=>{
  
  

  console.log(req.session.phoneNo)
  
  client
  .verify
  .services(process.env.twilio_serviceID)
  .verifications
  .create({
    to:`+91${req.session.phoneNo}`,
    channel:"sms"
}).then((data)=>{


  console.log(data)
  console.log(data.to)

  

  req.session.phone=data.to
  res.redirect('/users/otpconfirm')
  console.log('eedeee')
  console.log('resend otp petiillaaaa')

})
})


// otp confirmatiom
router.get('/otpconfirm',function(req,res){
  console.log('otp confirmation page')
  console.log(req.session.phone)
  res.render('user/otpconfirm',{errorMessage:req.session.otpfail})
  
})

router.post('/otpconfirm',function(req,res){
  console.log(req.body)
  var arr=Object.values(req.body)
  var otp=arr.toString().replaceAll(',','');
  console.log(otp);
  console.log(req.session.phone)
   
  client
    .verify
    .services(process.env.twilio_serviceID)
    .verificationChecks
    .create({
      to:req.session.phone,
      code:otp
    }).then((data)=>{
      console.log('pettu')
      
      if(data.valid){
        req.session.userLogIn=true;
        res.redirect('/users')
      }
      else{
        req.session.otpfail="Invalid otp"
        res.redirect('/users/otpconfirm')
      }
      
    })

})


// ********product view*******

router.get('/singleproduct',lastroute,async(req,res)=>{
  console.log('not working')
  console.log(req.query.id)
  console.log(req.session.userId)
  let proExist= await cartHelpers.exists(req.session.userId,req.query.id)
  console.log('juv vs psg')
  console.log(proExist)
  let Pcount=await cartHelpers.cartCount(req.session.userId)
  console.log(Pcount)
  console.log(Pcount.length)
  if(Pcount.length>0){
    req.session.count=Pcount[0].totalcount

  }
  else{
    req.session.count=''
  }

  
  productHelpers.getproductDetails(req.query.id).then((product)=>{
    productHelpers.getallproducts().then((products)=>{
     console.log(product)
      res.render('user/shop-single',{product,products,user:req.session.user,proExist,count:req.session.count})
    })
    
  })
 
})


router.get('/logout',(req,res)=>{
  req.session.userId=null
  req.session.userLogIn=false
  req.session.lastroute=null
  req.session.user=null
  req.session.count=null
  req.session.prodCart=null
  res.redirect('/users')
})


// *********shop**********
router.get('/shop',lastroute ,async(req,res)=>{

 let products= await productHelpers.getallproducts()
    console.log(products)
   categoryHelpers.getallCategoryDetails().then((category)=>{
    console.log(category)
    res.render('user/shop',{products,category,user:req.session.user,count:req.session.count});
    console.log('messi')

   })
  
})

router.get('/cart', verifyLogin ,lastroute,async function(req,res){
  console.log('woooooooooi')
  console.log('pettila')
  console.log('anik onnummnsilavall')
  console.log(req.session.userId)
  req.session.coupon=false
  let product=await cartHelpers.viewcart(req.session.userId)
  if(product.length==0){

  product.empty=true
  res.render('user/cart', {product,user:req.session.user})

  }
  else{
    let cartAmount=await cartHelpers.totalAmount(req.session.userId)
    let Pcount=await cartHelpers.cartCount(req.session.userId)
    console.log('ibdeeeeeeeeeeeeeeeeeeee')
    console.log(Pcount)
    console.log(cartAmount)
    console.log(cartAmount[0].totalamount)
    console.log('evde vare ethi')
    console.log(product)
    req.session.count=Pcount[0].totalcount
    req.session.totalAmount=cartAmount[0].totalamount
    req.session.prodCart=product
    
    res.render('user/cart', {product,total:cartAmount[0].totalamount,count:req.session.count,user:req.session.user})

  }
 
 
})
  // **********delete item in cart *****
router.get('/cartItemDlt',(req,res)=>{
  console.log(req.query.id)
  console.log(req.session.userId)
  cartHelpers.deleteitem(req.session.userId,req.query.id).then(()=>{
    res.redirect('/users/cart')
  })

})


router.get('/addtocart/:id', (req,res)=>{
  
  console.log('nnu messi kalli')
  console.log(req.params.id)
  console.log(req.session.userId)
  cartHelpers.addtocart(req.params.id,req.session.userId).then((response)=>{
 console.log("worked")
 if(req.session.userLogIn){
 res.json({status:true})
}
 else{
  res.json({status:false})
 }
  })
  
})



// ********change quantity*************
router.post('/changequantity',(req,res)=>{
  console.log('pettilaaaa')
  console.log(req.body)
  cartHelpers.changequantity(req.body).then((response)=>
  {
    console.log(response)
    res.json(response)
  })
})

// *****88888***CHECKOUT***88888****

router.get('/check',verifyLogin, cartcount,async(req,res)=>{
  console.log(req.session.prodCart)
  
  req.session.addressRoute=req.originalUrl

  console.log('last ucl match')
  console.log(req.session.totalAmount)
  let wallets=await wallet.findwallet(req.session.userId)

  userHelpers.findAddress(req.session.userId).then((resp)=>{
    console.log(resp)
    let response=[]

    if(!resp.length==0){
      response[0]=resp[0]
    }
    else{
      response=false
    }
    
    if(req.session.coupon){
      // var product = req.session.proCoupon
      console.log('kooi')
    
    }
    else{
      console.log('koot')


    }
    var product = req.session.prodCart


    res.render('user/checkout',{product,totalamount:req.session.totalAmount,response,wall:wallets.Total,user:req.session.user,count:req.session.count})

  })

})

router.post('/checkout',  async function(req,res){
  var user

  if(req.body.defaultAddress){

    console.log('psg vs aurede')
   let address= await userHelpers.findaAddress(req.session.userId,req.body.defaultAddress)
   user=address
   user.payment=req.body.payment
   user.message=req.body.message

  }
  else{
    console.log('messi kalikilla')
    user=req.body
    user.userid=req.session.userId

   let addAddress=await userHelpers.addAddress(user)
   console.log('what a fuck')

  }
  


  console.log(req.session.userId)
  let product= await orderHelper.findcart(req.session.userId)
  let prod=req.session.prodCart
  for(i=0;i<prod.length;i++){
   product[i].totalprice=prod[i].totalprice
   product[i].Status="Order Placed"
  }
  console.log('5:0')
  console.log(product)
  user.userid=req.session.userId
  user.total=req.session.totalAmount
  let items=await pay.items(req.session.userId)
  console.log('cr7 kalliknd')
  console.log(user)
  orderHelper.createOrder(user,product).then((response)=>{
    req.session.orderId = response.insertedId;
    orderId = response.insertedId;
    req.session.orderId=orderId
    console.log('antony parik')
    if(req.body.payment==='COD'){
      res.json({codSucess:true})

    }
    else if( req.body.payment ==='RazorPay'){
      console.log(req.session.totalAmount)
    userHelpers.generteRazorpay(orderId,req.session.totalAmount).then((response)=>{
      console.log('fucked')
      console.log(response)
      response.unkonwn = true;
      res.json(response);

    })
      
    }
   else if(req.body.payment ==='wallet'){
  wallet.walletPurchase(req.session.userId,req.session.totalAmount).then(()=>{
    
    res.json({codSucess:true})

  })


   }

    else{
      console.log('argtina oombi')
     console.log(items)
     total = items.reduce(function (accumulator, items) {
      return accumulator + items.price * items.quantity;
    }, 0)
     console.log(total)
     req.session.total=total
     pay.createorder(items,total).then((payment)=>{

      for (i = 0; i < payment.links.length; i++) {
        if (payment.links[i].rel == "approval_url") {
          res.json(payment.links[i]);
        }}

     })
     }
    })


  })


  // **********

  router.delete('/onfailure',(req,res)=>{
    console.log("fuckedooooi")
    res.json({status:true})
  })


  // ***********************paypal**********

  router.get("/verifyPaypal", (req, res) => {
    console.log('pettilaa')
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;
    console.log(req.session.orderId);
    pay.verify(payerId, paymentId, req.session.total).then(() => {
      console.log();
      orderHelper.setStatus(req.session.orderId).then(() => {
        res.redirect("/users/ordersucess");
      });
    });
  });
  



// ************post verify ************


router.get('/ordersucess',(req,res)=>{
  orderHelper.setStatus(req.session.orderId).then(()=>{
    orderHelper.removeCart(req.session.userId).then(()=>{
      res.render('user/orderSucces')

    })

  })

})
// ************view single order*******

router.get('/viewaorder',async(req,res)=>{
   console.log(req.query)
  // console.log(req.session.userId)
  let orders=  await orderHelper.vieworder(req.session.userId)
 
  
console.log('cr7 goal adichiila')
adminHelpers.viewSingeleproduct(req.query.id).then((product)=>{
  
     for(i=0;i<product.length;i++){
     if( product[i].SPstatus=='Delivered'){
      product[i].now=true
    }
    else if(product[i].SPstatus=='Requested Return'||product[i].SPstatus=='Order Cancelled'||product[i].SPstatus=="Approved return"||product[i].SPstatus=="Reject"){
      product[i].ret=true

    }
     }
     console.log(product)
     req.session.viewaorder=req.originalUrl

  res.render('user/order',{product,user:req.session.user,count:req.session.count})


})

  


})

router.get('/order',verifyLogin,async(req,res)=>{
  orderHelper.removeOrder()

  orderHelper.order(req.session.userId).then((orders)=>{
    // console.log(orders)
    
    res.render('user/viewallorders',{orders ,user:req.session.user})

   })

  
})

router.get('/orderHistory',verifyLogin,async(req,res)=>{
 let orderHistory= await orderHelper.orderhistory(req.session.userId)

 for(i=0;i<orderHistory.length;i++){
  if(orderHistory[i].status=='Order Placed'){
    orderHistory[i].Now=true
  }
  else{
    orderHistory[i].Now=false
  }

 }
 console.log(orderHistory)
  res.render('user/orderHistory',{orderHistory,count:req.session.count,user:req.session.user} )
})


// ********cancel order******\
router.get('/cancelOrder',(req,res)=>{
   console.log(req.query)
  // orderHelper.cancelorder(req.query.id).then(()=>{
    
    orderHelper.ordercancel(req.query.id,req.query.proId).then(()=>{
      res.redirect(req.session.viewaorder)

    })
  // })
  

  console.log(req.query.id)

})

router.get('/returnOrder',(req,res)=>{
  console.log(req.query)
  orderHelper.statuschange(req.query).then(()=>{
    res.json({status:true})
  })
})

// ************verify payment***********

router.post("/verify-payment", (req, res) => {
  console.log('fuuuuuuk')
  console.log(req.body);
  userHelpers
    .verifyOrder(req.body)
    .then(() => {
      orderHelper.setStatus(req.body["order[receipt]"]).then(() => {
        console.log('real vs liverpool')
        res.json({
          status: true,
        });
      });
    })
    .catch((err) => {
      res.json({
        status: false,
        errMsg: "",
      });
    });
});


router.get('/zoom',(req,res)=>{
  var a='63518af8dd428f3a460a8ef9'
  productHelpers.getproductDetails(a).then((product)=>{
    console.log(product)
    res.render('user/zoom',{product})
  })
 
})

router.post('/coupon',(req,res)=>{

console.log(req.body)
couponHelpers.findacoupon(req.body.name).then((coupon)=>{
  let date=new Date(coupon.expiryDate)
  console.log(date)
  datetoday=new Date()
  console.log(datetoday);
  if(date>datetoday ){
    console.log('arg vs uae')
    console.log(req.session.prodCart)
  // let pro=req.session.prodCart
  // pro.forEach(element => {
  //   element.products.price=Math.round(element. products.price*(100-coupon.percentage)/100)
  //   element.totalprice=Math.round(element.totalprice*(100-coupon.percentage)/100)
  
  // });
  // console.log(pro);
  //  req.session.proCoupon=pro
   req.session.coupon=true
   if(1>Math.round(coupon.maxAmount/(req.session.totalAmount*coupon.percentage/100))){
   req.session.totalAmount=Math.round(req.session.totalAmount*(100-coupon.percentage)/100)
  }
  else
  req.session.totalAmount=Math.round(req.session.totalAmount-coupon.maxAmount)

  console.log(coupon);
 let response = coupon
 response.status=true

  res.json(response)


  }
  else{

    console.log('argentina vs uae')
    
    
    res.json({expiry:true})
  }
 
  
}).catch((reject)=>{
  console.log(reject)
  console.log('arg vs uae')
  res.json({real:true})

})

})

router.get('/profile',verifyLogin,(req,res)=>{
  console.log(req.session.user)
  console.log('pettu')
  var address=req.session.user.Address
  console.log(address)
  wallet.findwallet(req.session.userId).then((response)=>{
    res.render('user/about',{user:req.session.user,wallet:response.Total})


  })


})

router.get('/route',(req,res)=>{

var a= req.url
console.log(a)

})
router.get('/editad',(req,res)=>{

  console.log('what a shme')
  userHelpers.findaAddress(req.session.userId,req.query.id).then((address)=>{
    console.log(address)
    res.render('user/editAddress',{address})

  })

})

router.post('/editad',(req,res)=>{
  console.log(req.body)
  userHelpers.updateAddres(req.session.userId,req.body).then(()=>{
    res.redirect(req.session.addressRoute)
  })
  
})

router.get('/manageAddress',verifyLogin,(req,res)=>{
  req.session.addressRoute=req.originalUrl
  userHelpers.findAddress(req.session.userId).then((response)=>{
    response[0].status=true
    console.log(response)
    res.render('user/manageAddress' ,{response})

  })
})

// router.get('/setAddress',(req,res)=>{
//   console.log(req.query.id)
// userHelpers.findaAddress(req.session.userId,req.query.id).then((response)=>{
//   console.log(response)
//   // userHelpers.changeDefault(req.session.userId,response,req.query.id)
//   res.redirect('/users/manageAddress')
// })
// })

router.get('/setAddress',(req,res)=>{
  console.log(req.query.id)
  userHelpers.findaAddress(req.session.userId,req.query.id).then((response)=>{
      console.log(response)
        userHelpers.changeDefault(req.session.userId,response,req.query.id).then(()=>{
          console.log('ooooooi')
           res.redirect('/users/manageAddress')
 
        })


  })

})



router.get('/wishlist',verifyLogin,(req,res)=>{
 wishlistHelpers.getwishlist(req.session.userId).then((wishlist)=>{
  console.log(wishlist)
  res.render('user/wishlist',{product:wishlist,user:req.session.user,count:req.session.count})
 })

})

router.get('/addtowishlist',verifyLogin,(req,res)=>{
  console.log(req.query.id)
  console.log('OMMBIIII')

  wishlistHelpers.addtowishlist(req.session.userId,req.query.id).then(()=>{
    res.json({status:true})
  })
})

router.get('/deletewishlist',(req,res)=>{
  console.log(req.query.id)
  console.log('poti')
wishlistHelpers.deleteWishlist(req.session.userId,req.query.id).then(()=>{
  res.redirect('/users/wishlist')
})
})

module.exports = router;
 
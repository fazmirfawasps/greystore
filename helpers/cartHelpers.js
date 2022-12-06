const { ObjectId } = require('mongodb')
var db=require('../config/connections')
var objectId=require('mongodb').ObjectID


module.exports={
  

    addtocart:(proid, userid)=>{
        console.log(userid)
  console.log('messi')
        objprod={
            product: objectId(proid),
            quantity: 1,
            time:new Date().getTime()
        }
        console.log('cr7')
        return new Promise(async(resolve, reject) => {
            let userCart= await db.get().collection('cart').findOne({user:objectId(userid)})
            console.log(userCart)
            if (userCart){
                let productexist = userCart.products.findIndex(products => products.product == proid)
                if(productexist == -1){
                    db.get().collection('cart').updateOne({user:ObjectId(userid)},
                    {
                        $push:{
                            products:objprod
                        }
                    }).then(()=>{
                        resolve()
                    })
                }
                else{
                    console.log('cr8')
                    resolve()
                }

                

            }

            else{
                let cartobj={
                    user: objectId(userid),
                    products: [objprod]
                }
                db.get().collection('cart').insertOne(cartobj).then(()=>{
                    resolve()
                })
            }
          


        })
    },
    viewcart:(userid)=>{
        return new Promise(async(resolve, reject) => {
            let user= await db.get().collection('cart').findOne({user:ObjectId(userid)})
            console.log('neymar')
            if (user){
                console.log('ithlk keri')
                console.log(user)
                let userCart=await db.get().collection('cart').aggregate([{
                    $match:{
                        user:ObjectId(userid)
                    }
                   },
                   {
                    $unwind: '$products'
                   },{
                    $project: {
                        product: '$products.product',
                        count: '$products.quantity',
                        insertionTime:"$products.time"
                    }
                   },
                   {
                    $lookup:{
                        from:'product',
                        localField:"product",
                        foreignField:"_id",
                        as:'cartItems'
                    }
                   },{
                    $project:{
                        count:1,insertionTime:1,products:{$arrayElemAt:["$cartItems",0]}
                    }
                },
                {$project:{
                    count:1,insertionTime:1,products:1,totalprice:{$multiply:['$count',{$toInt:'$products.offerprice'}]}
                }
                },{
                   $project: {
                    count:1,insertionTime:1,products:1,totalprice:1,

                        totalamount:{$sum:'$totalprice'}
                    }
                }

            ]).toArray()
            console.log(userCart)
        
            resolve(userCart)
            }
            else{
                resolve([])
            }
        })
    },

    deleteitem: (userid, prodid) => {
        return new Promise((resolve, reject) => {
            db.get().collection('cart').updateOne({
                user: objectId(userid)
            }, {
                $pull: {
                    products:{product:objectId(prodid)}
                }
            }).then(() => {
                resolve()
            })
        })
    },

    changequantity:(item)=>{
        console.log('messi today match')
        console.log(item.quantity)
        console.log(item.count)
        count=parseInt(item.count)
        item.quantity=parseInt(item.quantity)

        return new Promise((resolve,reject)=>{
            if(item.count==-1&&item.quantity==1){
                db.get().collection('cart').updateOne({_id:objectId(item.cart)},{
                    $pull:{products:{product:objectId(item.product)}}
                }).then(()=>{
                    resolve({removeproduct:true})
                })
            }else{
                db.get().collection('cart').updateOne({_id:objectId(item.cart),'products.product':objectId(item.product)},
                {
                    $inc:{'products.$.quantity':count}
                }).then(()=>{
                    resolve(true)
                })
            }
        })

    },
    totalAmount:(userid)=>{
        return new Promise(async(resolve, reject) => {
            let user= await db.get().collection('cart').findOne({user:ObjectId(userid)})
            console.log('neymar')
            if (user){
                console.log('ithlk keri')
                console.log(user)
                let cartamount=await db.get().collection('cart').aggregate([{
                    $match:{
                        user:ObjectId(userid)
                    }
                   },
                   {
                    $unwind: '$products'
                   },{
                    $project: {
                        product: '$products.product',
                        count: '$products.quantity',
                        insertionTime:"$products.time"
                    }
                   },
                   {
                    $lookup:{
                        from:'product',
                        localField:"product",
                        foreignField:"_id",
                        as:'cartItems'
                    }
                   },{
                    $project:{
                        count:1,insertionTime:1,products:{$arrayElemAt:["$cartItems",0]}
                    }
                },
                {$project:{
                    count:1,insertionTime:1,products:1,totalprice:{$multiply:['$count',{$toInt:'$products.offerprice'}]}
                }
                },{
                   $group: {
                   _id:null,

                        totalamount:{$sum:'$totalprice'}
                    }
                }

            ]).toArray()
            
        
            resolve(cartamount)
            }
        })
    },
    
    cartCount:(userid)=>{
        return new Promise(async(resolve, reject) => {
            
             user= await db.get().collection('cart').findOne({user:ObjectId(userid)})
            console.log('neymar')
            if (user){
                console.log('ithlk keri')
                console.log(user)
                let totalcount=[]
                 totalcount=await db.get().collection('cart').aggregate([{
                    $match:{
                        user:ObjectId(userid)
                    }
                   },
                   {
                    $unwind: '$products'
                   },{
                    $project: {
                        product: '$products.product',
                        count: '$products.quantity',
                        insertionTime:"$products.time"
                    }
                   },
                   {
                    $lookup:{
                        from:'product',
                        localField:"product",
                        foreignField:"_id",
                        as:'cartItems'
                    }
                   },{
                    $project:{
                        count:1,insertionTime:1,products:{$arrayElemAt:["$cartItems",0]}
                    }
                },
                {$project:{
                    count:1,insertionTime:1,products:1,totalprice:{$multiply:['$count',{$toInt:'$products.price'}]}
                }
                },{
                   $group: {
                   _id:null,

                        totalcount:{$sum:'$count'}
                    }
                }

            ]).toArray()
            
        
            resolve(totalcount)
            }
            else{
                resolve([])
            }
        })
    },
    
    exists:(userid,proid)=>{
        var data={}
        return new Promise(async(resolve, reject) => {
            let cart=await db.get().collection('cart').findOne({user:objectId(userid)})
            if (cart) {
                console.log(proid);
                let productexist = cart.products.findIndex(products => products.product == proid)
                console.log(productexist);
                if(productexist==-1){
                    data.exists=false
                    resolve(data)
                }
                else{
                    data.exists=true
                    resolve(data)
                }
            }
            else{
                data.exists=false
                resolve(data)
            }
        })
    
 

  
    
}
}
var db=require('../config/connections')
var objectId=require('mongodb').ObjectID
module.exports={

findwallet:(id)=>{

return new Promise((resolve, reject) => {
    db.get().collection('wallet').findOne({user:objectId(id)}).then((response)=>{
           console.log(response)
        resolve(response)



    })
})

},getRefund: (data, price) => {
    return new Promise((resolve, reject) => {
        

    details = {
      From: "Refund",
      credited: price,
      Time: new Date(),
    };
    db.get()
      .collection('wallet')
      .updateOne(
        { user: objectId(data) },
        { $inc: { Total: parseInt(price) }, $push: { History: details } }
      )
      .then((response) => {
        resolve(response);
      });
    }) 
 },
 
 walletPurchase:(userId,price)=>{
    return new Promise((resolve, reject) => {
      details = {
        From: "Purchase",
        credited: -price,
        Time: new Date(),
      };
      db.get()
        .collection('wallet')
        .updateOne(
          { user: objectId(userId) },
          { $inc: { Total: parseInt(-price) }, $push: { History: details } }
        )
        .then(() => {
          resolve();
        });
      })
  }
  
}
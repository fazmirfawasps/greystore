var db=require('../config/connections')
var objectId=require('mongodb').ObjectID

module.exports={
  orderCntrl:(i,details)=>{
    console.log('ithlk kerilaaaaa')
    return new Promise((resolve, reject) => {
       async function work(){
        for(j=0;i<j;j++){
            await db.get().collection('orderControl').insertOne(details.j)
            
        }

        }
        work()
        
        

    })
  }


}
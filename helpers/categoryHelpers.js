var db=require('../config/connections')
var objectId=require('mongodb').ObjectID
module.exports={

addcategory:(cdata)=>{
    console.log('fuck')
   return new Promise(async(resolve, reject) => {
    let cat = await db.get().collection('Category').find({category:cdata.category}).toArray()
    console.log(cat)
    if(!cat.length==0){
        resolve({status:true})
    }
    else{
        db.get().collection("Category").insertOne(cdata).then((response)=>{

            resolve(response)
            console.log(response)
        })
       
        
       
    
    }
})
   
}, 
getallCategoryDetails:()=>{
   return new Promise(async(resolve, reject) => {
    let category=  await db.get().collection('Category').find().toArray()
    resolve(category)

   })

},
deleteCategory:(data)=>{
    return new Promise((resolve, reject) => {
        db.get().collection('Category').remove({_id:objectId(data)}).then((response)=>{
            console.log('deleted')
            resolve(response)
            
        })
    })

},
updateCategory:(catId,cat)=>{
    return new Promise((resolve, reject) => {
        console.log(cat)
        db.get().collection('Category').updateOne({_id:objectId(catId)},
        {$set:{
            category:cat
        }
        }).then((response)=>{
            console.log('fucked')
            resolve(response)
            console.log('pettttoooo')
        })
    })
}


}
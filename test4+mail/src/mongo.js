let MongoClient = require('mongodb')
let url = "mongodb://localhost:27017/"

class MongoDB
{
    constructor()
    {        
        this.db = this.init()
    }

    async init()
    {
        let client =await MongoClient.connect(url,{ useNewUrlParser: true })
        let db=await client.db('tinyfunny')
        //let data =await this.db.collection("accounts").find({}).toArray()
        return db
    }

    load(collection_name)
    {
        
        return this.db.then(function(db)
        {
            let result = db.collection(collection_name).find({}).toArray()
            return result
        })
    }



    // 查询接口
    find(collection_name,cond,option=null)
    {
        return this.db.then(function(db)
        {
            return db.collection(collection_name).find(cond,option).toArray()
        })
    }

    //查询单个
    find_one(collection_name,cond,option=null)
    {
        return this.db.then(function(db)
        {
            return db.collection(collection_name).findOne(cond,option)
        })
    }

    //修改一个
    update(collection_name,cond, info)
    {
        return this.db.then(function (db)
        {
            return db.collection(collection_name).updateOne(cond, info)
        })
    }
    //修改多个
    update_many(collection_name,cond,info)
    {
        return this.db.then(function (db)
        {
            return db.collection(collection_name).updateMany(cond, info)
        })
    }

    //删除一个
    delete(collection_name,cond)
    {
        return this.db.then(function (db)
        {
            return db.collection(collection_name).deleteOne(cond)
        })
    }
    //删除多个
    delete_many(collection_name,cond)
    {
        return this.db.then(function (db)
        {
            return db.collection(collection_name).deleteMany(cond)
        })
    }
    //添加
    insert(collection_name,cond)
    {
        return this.db.then(function(db)
        { 
            return db.collection(collection_name).insertOne(cond)
        })
    }
}


module.exports = MongoDB

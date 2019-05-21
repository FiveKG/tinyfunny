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

    load(collention_name,cond)
    {
        
        return this.db.then(function(db)
        {
            let result = db.collection(collention_name).find(cond).toArray()
            return result
        })
    }



    // 查询接口
    find(collention_name,cond)
    {
        return this.db.then(async function(db)
        {
            return db.collection(collention_name).find(cond).toArray()
        })
    }

    //查询单个
    find_one(collention_name,cond)
    {
        return this.db.then(function(db)
        {
            return db.collection(collention_name).findOne(cond)
        })
    }

    //修改 
    update(collention_name,cond, info)
    {
        return this.db.then(function (db)
        {
            return db.collection(collention_name).updateOne(cond, info)
        })
    }

    //删除
    delete(collention_name,cond)
    {
        return this.db.then(function (db)
        {
            return db.collection(collention_name).deleteOne(cond)
        })
    }

    //添加
    insert(collention_name,cond)
    {
        return this.db.then(function(db)
        { 
            return db.collection(collention_name).insertOne(cond)
        })
    }
}


module.exports = MongoDB

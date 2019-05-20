let MongoClient = require('mongodb').MongoClient
let url = "mongodb://localhost:27017/"

class MongoDB
{
    constructor(collection)
    {   
        this.collection = collection
        let that = this
        this.conn = MongoClient.connect(url, { useNewUrlParser: true }).then(function (db)
        {
            return db.db('tinyfunny').collection(that.collection)//返回一个promise
        })
    }


    // 查询接口
    find(cond, call_back)
    {
        this.conn.then(function (db)
        {
           db.find(cond).toArray(call_back)
        })
    }

    //查询单个
    find_one(cond, call_back)
    {
        this.conn.then(function (db)
        {
            db.findOne(cond,call_back)
        })
    }

    //修改 
    update(cond, info, call_back)
    {
        this.conn.then(function (db)
        {
            db.updateOne(cond, info,call_back)
        })
    }

    //删除
    delete(cond, call_back)
    {
        this.conn.then(function (db)
        {
            db.deleteOne(cond,call_back)
        })
    }

    //添加
    insert(cond,call_back)
    {
        this.conn.then(function(db)
        {
            db.insertOne(cond,call_back)
        })
    }
}
module.exports = MongoDB

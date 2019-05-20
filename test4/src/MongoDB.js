let MongoClient = require('mongodb').MongoClient
let url = "mongodb://localhost:27017/"

class MongoDB
{
    constructor()
    {
        this.tinyfunnyDB = MongoClient.connect(url, { useNewUrlParser: true })
        this.conn = MongoClient.connect(url, { useNewUrlParser: true }).then(function (db)
        {
            return db.db('tinyfunny').collection('players')//返回一个promise
        })

        this.acc_conn = MongoClient.connect(url, { useNewUrlParser: true }).then(function (db)
        {
            return db.db('tinyfunny').collection('accounts')//返回一个promise
        })
    }

    find_accounts(cond,call_back)
    {
        this.acc_conn.then(function(db)
        {
            db.find(cond).toArray(call_back)
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

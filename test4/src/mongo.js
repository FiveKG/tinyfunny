let MongoClient = require('mongodb').MongoClient
let url = "mongodb://localhost:27017/"

class MongoDB
{
    constructor()
    {
        this.mongod_handler = null
        this.tinyfunnyDB = MongoClient.connect(url, { useNewUrlParser: true })
        this.conn = MongoClient.connect(url, { useNewUrlParser: true }).then(function (db)
        {
            return db.db('tinyfunny').collection('players')//返回一个promise
        })

    }

    // 查询接口
    find(cond, call_back)
    {
        this.conn.then(function (db)
        {
            let ret = db.find({ "_id": id })
            call_back(ret)
        })
    }

    //查询单个
    find_one(id, call_back)
    {
        this.conn.then(function (db)
        {
            db.findOne({ "_id": id })
            call_back()
        })
    }

    //修改 
    update(cond, info, call_back)
    {
        this.conn.then(function (db)
        {
            let ret = db.updateOne(cond, info)
            call_back(ret)
        })
    }

    //删除
    delete(cond, call_back)
    {
        this.conn.then(function (db)
        {
            db.deleteOne(cond)
            call_back()
        })
    }
}

module.exports = MongoDB

let MongoClient = require('mongodb').MongoClient
let url = "mongodb://localhost:27017/"

class MongoDB{
    constructor()
    {
        this.mongod_handler = null
        this.tinyfunnyDB = MongoClient.connect(url, { useNewUrlParser: true })
        this.conn = MongoClient.connect(url, { useNewUrlParser: true }).then(function(db)
        {
                return db.db('tinyfunny').collection('players')//返回一个promise
        }) 
    }
    
    //检查query规则
    check_query(id,name=null,sex=null,pwd=null)
    {
        let query =null
        if(id)
        {
            id = parseInt(id)
            query = {"_id":id}
        }
        if(name)
        {
            query["name"]=name
        }
        if(sex)
        {
            query["sex"]=sex
        }
        if(pwd)
        {
            query["pwd"]=pwd
        }
        return query
    }
    operate_mogonDB(opearte,data)
    {  
        let that = this
        switch(opearte)
        {
            case opearte =='find_player':
                let result = this.find_player(data)
                that.mongod_handler(result)
                break
            case opearte =='create_player':
                this.create_player(data)
                break
            default:
            break
        }

    }

    //查，根据id返回一个玩家信息，不输入id则返回所有玩家信息，返回promise,参数为[data]
    async find_player(id)
    {

        let query = await this.check_query(id)
        return await this.conn.then(function(db)
        {
             return db.findOne(query)
        })
 
    }


    //插入，返回promise，参数res，err
    async create_player([id,name,sex,pwd])
    {
        let query = await this.check_query(id,name,sex,pwd)

        return await this.conn.then(function(db)
        {
            return db.insertOne(query)
        })
    }

    //更新,根据id改名字，返回promise，参数res，err
    async update_name(id,new_name)
    {
        let query = await this.check_query(id)
        let update_command = {$set:{"name":new_name}}

        return await this.conn.then(function(db)
        {
            return db.updateOne(query,update_command)
        })
    }

    //删除,根据id删除玩家,返回promise，参数res，err
    async delete_player(id)
    {
        let query = await this.check_query(id)
        return await this.conn.then(function(db)
        {
            return db.deleteOne(query)
        })
    }

    set_handler(handler)
    {
        this.mongod_handler = handler
    }

}

module.exports = MongoDB

// let mongodb = new MongoDB()
// //查询
// let result = mongodb.find_player("1001")
// result.then(function(res,err)
// {     
//     console.log(res)
// })

//插入
// let result = mongodb.create_player(1014,"1014","male","123")
// result.then(function(err,res)
// {    
    
// })

//更新
// let result =mongodb.update_name(1001,'aaaaaa')
// result.then(function(res,err)
// {     
//     console.log(res)
// })

//删除
// let result = mongodb.delete_player("1010")
// result.then(function(res,err)
// {     
//     console.log(res)
// })

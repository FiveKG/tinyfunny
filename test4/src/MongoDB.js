let MongoClient = require('mongodb').MongoClient
let url = "mongodb://localhost:27017/"


// MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
//   if (err){
//     throw err
//   }
//   console.log("数据库已连接!")
//   let dbase = db.db('tinyfunny')
//   //插入测试
//   // let myobj = {_id:1004,name:"1004",sex:"female"}
//   // dbase.collection("players").insertOne(myobj,function(err,res){
//   //   if (err) throw err
//   //   console.log("文档插入成功")
//   //   db.close()
//   // })

//   //查看测试
//   // dbase.collection('players').find({}).toArray(function(err,result){
//   //   if (err) throw err
//   //   console.log(result)
//   //   db.close()
//   // })
  
//   //更新测试
//   // let filter = {"_id":1001}
//   // let update_command = {$set:{"name":"1001"}}
//   // dbase.collection('players').updateOne(filter,update_command,function(err,res){
//   //   if (err) throw err
//   //       console.log("文档更新成功")
//   //       console.log(res.result)
//   //       db.close()
//   // })

//   //删除测试
//   // let filter = {'_id':1004}
//   // dbase.collection('players').deleteOne(filter,function(err,obj){
//   //   if (err) throw err
//   //   console.log(obj.result)
//   //   db.close()
//   // })
//   db.close()
// })


class MongoDB{
  constructor()
  {
    this.result = null
    this.conn = MongoClient.connect(url, { useNewUrlParser: true }) //返回一个promise
  }

  //查，根据id返回一个玩家信息，不输入id则返回所有玩家信息，参数为result
  check_player(id,callback_player)
  {
    let filter =null
    if(id)
    {
      id = parseInt(id)
      filter = {_id:id}
    }
    else
    {
      filter = {}
    }
    this.conn.then(function(db)
    {
        db.db('tinyfunny').collection('players').find(filter).toArray(function(err,res)
        {
            callback_player(err,res)
        })
    })
  }


  //插入，无返回值
  insert_player(id,name,sex,pwd,callback_player)
  {
    let filter = {_id:id,name:name,sex:sex,pwd:pwd}
    //插入操作
    this.conn.then(function(db)
    {
      db.db('tinyfunny').collection('players').insertOne(filter,function(err,res)
      {
         callback_player(err,res)
      })
    })
  }

  //更新,根据id改名字
  update_name(id,new_name,callback_player)
  {
    let filter = {_id:id}
    let update_command = {$set:{"name":new_name}}

    this.conn.then(function(db)
    {
      db.db('tinyfunny').collection('players').updateOne(filter,update_command,function(err,res)
      {
          callback_player(err,res)
      })
    })
  }

  //删除,根据id删除玩家,无返回值
  delete_player(id,callback_player)
  {
    let filter = {_id:id}
    this.conn.then(function(db)
    {
      db.db('tinyfunny').collection('players').deleteOne(filter,function(err,res)
      {
          callback_player(err,res)
      })
    })
  }

  //断开连接
  close_DB()
  {
    this.conn.then(function(db)
    {
      db.close()
    })
  }
}

module.exports = MongoDB

// let mongodb = new MongoDB()
// //查询
// mongodb.check_player(3732,function(err,res){
//   console.log(res)
// })


//插入
// let player = mongodb.insert_player(1002,"1002","male","123")


//更新
// mongodb.update_player(1001,'1000')

//删除
// mongodb.delete_player(1001)
// mongodb.close_DB()


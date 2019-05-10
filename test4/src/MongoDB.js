let MongoClient = require('mongodb').MongoClient;
let url = "mongodb://localhost:27017/";


// MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
//   if (err){
//     throw err;
//   }
//   console.log("数据库已连接!");
//   let dbase = db.db('tinyfunny');
//   //插入测试
//   // let myobj = {_id:1004,name:"1004",sex:"female"};
//   // dbase.collection("players").insertOne(myobj,function(err,res){
//   //   if (err) throw err;
//   //   console.log("文档插入成功");
//   //   db.close();
//   // });

//   //查看测试
//   // dbase.collection('players').find({}).toArray(function(err,result){
//   //   if (err) throw err;
//   //   console.log(result);
//   //   db.close();
//   // });
  
//   //更新测试
//   // let filter = {"_id":1001};
//   // let update_command = {$set:{"name":"1001"}};
//   // dbase.collection('players').updateOne(filter,update_command,function(err,res){
//   //   if (err) throw err;
//   //       console.log("文档更新成功");
//   //       console.log(res.result);
//   //       db.close();
//   // });

//   //删除测试
//   // let filter = {'_id':1004};
//   // dbase.collection('players').deleteOne(filter,function(err,obj){
//   //   if (err) throw err;
//   //   console.log(obj.result)
//   //   db.close();
//   // });
//   db.close();
// });


class MongoDB{
  constructor(){
    this.result = null;
    this.conn = MongoClient.connect(url, { useNewUrlParser: true }) //返回一个promise
  }

  //查，根据id返回一个玩家信息，不输入id则返回所有玩家信息，返回类型为promise,参数为result

  check_player(id,callback_player){
    let filter =null
    if(id){
      filter = {_id:id};
    }
    else{
      filter = {};
    }
    return this.conn.then(function(db){
            return db.db('tinyfunny').collection('players').find(filter).toArray();
          }).then(function(result){
            callback_player(result)
            return result;
          });
  }


  //插入，无返回值
  insert_player(id,name,sex,pwd){
    let filter = null;
    if(id&&name&&sex&&pwd){
      filter = {_id:id,name:name,sex:sex,pwd:pwd};
    }
    else{
      console.log('填写信息有误')
      return
    }
    this.conn.then(function(db){
      db.db('tinyfunny').collection('players').insertOne(filter,function(err,res){
            if (err) {
              console.log("更新异常"+err);
              return err;
            }
            console.log("更新结果："+JSON.stringify(res.result));
          });
    });
  }

  //更新,根据id改名字,无返回值
  update_player(id,new_name){
    let filter = null;
    let update_command = null;
    if(id&&new_name){
      filter = {_id:id};
      update_command = {$set:{"name":new_name}}
    }
    else{
      console.log('填写信息有误')
      return
    }
    this.conn.then(function(db){
      db.db('tinyfunny').collection('players').updateOne(filter,update_command,function(err,res){
            if (err) {
              console.log("更新异常"+err);
              return err;
            }
            console.log("更新结果："+JSON.stringify(res.result));
          });
    });
  }

  //删除,根据id删除玩家,无返回值
  delete_player(id){
    let filter = null;
    if(id){
      filter = {_id:id};
    }
    else{
      console.log('填写信息有误')
      return
    }
    this.conn.then(function(db){
      db.db('tinyfunny').collection('players').deleteOne(filter,function(err,res){
            if (err) {
              console.log("删除异常"+err);
              return err;
            }
            console.log("删除结果："+JSON.stringify(res.result));
          });
    });
  }

  //断开连接
  close_DB(){
    this.conn.then(function(db){
      db.close()
    })
  }
}

module.exports = MongoDB;

// let mongodb = new MongoDB();
//查询
// let player = mongodb.check_player();
// player.then(function(result){
//   console.log(result)
// })
//插入
// let player = mongodb.insert_player(1002,"1002","male","123");


//更新
// mongodb.update_player(1001,'1000');

//删除
// mongodb.delete_player(1001);
// mongodb.close_DB()


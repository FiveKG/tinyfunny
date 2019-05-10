MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
  if (err){
    throw err;
  }
  console.log("数据库已连接!");
  let dbase = db.db('tinyfunny');
  //插入测试
  let myobj = {_id:1004,name:"1004",sex:"female"};
  dbase.collection("players").insertOne(myobj,function(err,res){
    if (err) throw err;
    console.log("文档插入成功");
    db.close();
  });

  //查看测试
  // dbase.collection('players').find({}).toArray(function(err,result){
  //   if (err) throw err;
  //   console.log(result);
  //   db.close();
  // });
  
  //更新测试
  // let filter = {"_id":1001};
  // let update_command = {$set:{"name":"1001"}};
  // dbase.collection('players').updateOne(filter,update_command,function(err,res){
  //   if (err) throw err;
  //       console.log("文档更新成功");
  //       console.log(res.result);
  //       db.close();
  // });

  //删除测试
  // let filter = {'_id':1004};
  // dbase.collection('players').deleteOne(filter,function(err,obj){
  //   if (err) throw err;
  //   console.log(obj.result)
  //   db.close();
  // });
  db.close();
});
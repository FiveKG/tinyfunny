let ShowMem= require('./ShowMem');
let Player = require('./Player');
let NoReNum = require('./NoReNum');

let NoReNum_object = new NoReNum();
let NoReNum_array = NoReNum_object.makeNum(10000);
function List_store() {
  //定义一个Node类，player用来保存节点上的数据，next表示指向链表中下一个项的指针
  let Node = function(player) {
    this.player = player;
    this.next = null;
  }

  //用length表示列表的数量
  let length = 0;
  //head存储第一个节点的引用
  let head = null;

  //向列表头部添加一个新的项
  this.append = function(id,name,level) {
    let player = new Player(id,name,level);
    let node = new Node(player);
    
    if(head) {
      node.next = head;
    }else {
      node.next = null
    }
    head = node;
    length++;
  };
  //从列表的特定位置移除一项,根据index来删除
  this.removeAt = function(position) {
    if(position > -1 && position < length) {
      let current = head,
          previous,
          index = 0;

      //移除第一项
      if(position === 0) {
        head = current.next;
      } else {
        while (index++ < position) {
          previous = current;
          current = current.next;
        }
        //将previous与current的下一项链接起来：跳过current，从而移除它
        previous.next = current.next;
      }
      length--;
      return current.player;
    }else {
      return null;
    }
  };

  //返回元素在列表中的索引。如果列表中没有该元素则返回null,根据ID找
  this.indexOf = function(id) {
    let current = head,
        index = 0;

    //循环这个链表，如果找到就返回index
    while(current) {
      if(id === current.player.id) {
        return index;
      }
      index++;
      current = current.next;
    }
    return null;
  };

  //从列表中移除一项，根据ID来删除
  this.remove = function(id) {
    //找到这个元素的索引值
    let index = this.indexOf(id);
    return this.removeAt(index);
  };

  //如果链表中不包含任何元素，返回true，如果链表长度大于0则返回false。
  this.isEmpty = function() {
    return length === 0;
  };

  this.size = function() {
    return length;
  };


  
  //查找某个玩家,返回节点数据，无则返回null
  this.find = function(id){
    let current = head;
    while(current){
      if(current.player.id === id){
        return current.player;
      }
      current = current.next;
    }
    return null
  };

  //修改玩家信息
  this.modify_name = function(id,new_name){
    let player = this.find(id);
    player.name =new_name;
  };

  //展示所有
  this.show = function(){
    let current = head;
    while(current){
      console.log(current.player)
      current = current.next;
      }
  };
}
module.exports = List_store;

//内存测试
function List_text(count){
  let mem = 0;
  for(let i=0;i<count;i++){
      mem1= ShowMem();
      let list = new List_store();
      for(let i=1;i<=1000000;i++){
        list.append(i,'name_'+i,i)
      }
      mem2= ShowMem();
      mem +=mem2-mem1
  }
  return mem/count
}


//测试代码完整性用
// let test = new List_store();
// for(let i=1;i<101;i++){
//   test.append(i,'name_'+i,i)
// }
// console.log(test.find(25));
// test.modify_name(25,'abc');
// console.log(test.find(25));
// console.log(test.size());

// console.log(test.indexOf(99)); 
// test.remove(99);
// console.log(test.show())
// console.log(test.size());

let mem_pre = ShowMem();
let array = new List_store()
let t = null;//每次添加时间
let all_t = null;//每次添加时间的总和
    
    for(let i =0;i<100000;i++){
        t1 = process.uptime()*1000;
        array.append(i,'name'+i,'level'+i)
        t2 = process.uptime()*1000;
        t= t2-t1;
        all_t +=t
    }  
    
console.log('平均添加时间为:'+all_t/100000)
let mem_aft = ShowMem();
console.log('占内存：'+(mem_aft-mem_pre))



// t = null;
// all_t = null;
// for(let i =0;i<10000;i++){
//     t1 = process.uptime()*1000;
//     array.find(NoReNum_array[i])
//     t2 = process.uptime()*1000;
//     t= t2-t1;
//     all_t +=t
// }
// console.log('平均查找时间为:'+all_t/10000)

// t = null;
// all_t = null;
// for(let i =0;i<10000;i++){
//     t1 = process.uptime()*1000;
//     array.modify_name(NoReNum_array[i],'xxxx')
//     t2 = process.uptime()*1000;
//     t= t2-t1;
//     all_t +=t;
// }
// console.log('平均修改时间为:'+all_t/10000)

t = null;
all_t = null;
for(let i =0;i<10000;i++){
    t1 = process.uptime()*1000;
    array.removeAt(NoReNum_array[i])
    t2 = process.uptime()*1000;
    t= t2-t1;
    all_t +=t;
}
console.log('平均删除时间为:'+all_t/10000)


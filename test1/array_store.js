let ShowMem = require('./ShowMem');
let Player = require('./Player');
let NoReNum = require('./NoReNum');

let NoReNum_object = new NoReNum();
let NoReNum_array = NoReNum_object.makeNum(10000);

function Array_store(){
    let id_pool = [];
    let length = 0;

    //添加接口
    this.append=function(id,name,level){
        let player = new Player(id,name,level);
        length = id_pool.push(player)
        
    };

    //查询接口,@parsm:id;
    //有结果返回结果，无则null
    this.find = function(id){
        for(let i =0;i<length;i++){
            if(id_pool[i].id===id){
                  return id_pool[i]
            }
        }
        return null
    }
    //返回索引,,@parsm:id;
    //有结果返回结果，无则null
    this.index = function(id){
        for(let i =0;i<length;i++){
            if(id_pool[i].id===id){
                  return i
            }
        }
        return null
    }

    //改姓名接口,@parsm:id,new_name;
    //成功返回true，失败返回false
    this.modify_name = function(id,new_name){
        let plyaer = this.find(id);
        plyaer.name=new_name;
        return true;
        return false;
    }

    //删除接口,@parsm:id
    //成功返回true，失败返回false
    this.remove = function(id){
        let index_num = this.index(id);
        id_pool.splice(index_num,1);
        return true;
        return false;
    }

    //查看长度
    this.size= function(){
        return length;
    }
    //查看所有数据
    this.show=function(){
        console.log(id_pool)
    }
}

//测试用
// let array = new Array_store()
// for(i=0;i<100;i++)
// {
//     array.append(i,i,i);
// }
// array.show()
// console.log(array.size())
// console.log(array.find(55));
// console.log(array.modify_name(55,'xxxx'));
// console.log(array.find(55));
// console.log(array.index(55));
// console.log(array.remove(55));
// array.show()

let mem_pre = ShowMem();
let array = new Array_store()
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

t = null;
all_t = null;
for(let i =0;i<10000;i++){
    t1 = process.uptime()*1000;
    array.modify_name(NoReNum_array[i],'xxxx')
    t2 = process.uptime()*1000;
    t= t2-t1;
    all_t +=t;
}
console.log('平均修改时间为:'+all_t/10000)

// t = null;
// all_t = null;
// for(let i =0;i<10000;i++){
//     t1 = process.uptime()*1000;
//     array.remove(NoReNum_array[i])
//     t2 = process.uptime()*1000;
//     t= t2-t1;
//     all_t +=t;
// }
// console.log('平均删除时间为:'+all_t/10000)

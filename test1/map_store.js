let ShowMem= require('./ShowMem');
let Player = require('./Player');
let NoReNum = require('./NoReNum');

let NoReNum_object = new NoReNum();
let NoReNum_array = NoReNum_object.makeNum(10000);

function Map_store(){
    let id_pool = new Map();
    let length = 0;
    //添加接口
    this.append = function(id,name,level){
        let player = new Player(id,name,level);
        id_pool.set(id,player);
        length++;
    };
    //查询接口，@parsm:id;
    //玩家存在返回数据，不存在返回null
    this.find = function(id){
        let id_info = id_pool.get(id);
        if (id_info) return id_info
        else return null
    };

    //修改接口,@parsm:id,name;
    //成功返回true,失败返回false
    this.modify_name = function(id,new_name){
        id_pool.get(id).name= new_name;
        return true;
    };

    //删除接口,@parsm:id
    //成功返回true,失败返回false,根据ID
    this.remove =function(id){
        return id_pool.delete(id)
    };

    //展示个数
    this.size = function(){
        return length;
    };

    //展示所有数据
    this.show = function(){
        console.log(id_pool)
    }
}


//测试用
// let array = new Map_store()
// for(i=0;i<100;i++)
// {
//     array.append(i,i,i);
// }
// array.show()
// console.log(array.size())
// console.log(array.find(55));
// console.log(array.modify_name(55,'xxxx'));
// console.log(array.find(55));
// console.log(array.remove(55));
// array.show()



let mem_pre = ShowMem();
let array = new Map_store()
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

t = null;
all_t = null;
for(let i =0;i<10000;i++){
    t1 = process.uptime()*1000;
    array.find(NoReNum_array[i])
    t2 = process.uptime()*1000;
    t= t2-t1;
    all_t +=t
}
console.log('平均查找时间为:'+all_t/10000)

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

// function Players(id,name)
// {
//     this.id = id ;
//     this.name = name ;
//     this.level = level ;
// }
// module.exports = Players;

class Players{
    constructor(id,name,sex,statue=0){
        this.id = id;
        this.name = name;
        this.sex = sex;
        this.statue = statue;//1为在线，0为下线
    }
    toString(){
        return("玩家id："+this.id+'，'+"名称："+this.name+","+"性别："+this.sex+","+"登陆状态:"+this.statue);
    }
}
module.exports = Players;

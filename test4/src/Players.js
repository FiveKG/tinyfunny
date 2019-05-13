class Players{
    constructor(id,name,sex,statue=0){
        this.id = id
        this.name = name
        this.sex = sex
        this.statue = statue//1为肯定，0为否定
    }
    check_player(id)
    {
        
    }
    toString()
    {
        console.log(("玩家id："+this.id+'，'+"名称："+this.name+","+"性别："+this.sex+","+"登陆状态:"+this.statue))
    }
}
module.exports = Players

class Players{
    constructor(pid,name,sex,pwd)
    {
        this.pid = null
        this.name = null
        this.sex = null
        this.pwd = null
        this.statue = null//1为肯定，0为否定
    }
     //登陆，成功返回true，失败返回false
    log_in([pid,pwd])
    {
        if(this.pid ==pid && this.pwd ==pwd)
        {
            this.statue = 1
            return true
        }
        else
        {
            return false
        }
    }

     //登出，成功返回true
    log_out()
    {
        this.statue = 0
        return true
    }

     //更名，成功返回true，失败返回false
    update_name(new_name)
    {
        if(this.statue)
        {
            this.name = new_name
            return true
        }
        else
        {
            console.log('未登陆')
            return false
        }
    }

    toString()
    {
        console.log(("玩家pid："+this.pid+'，'+"名称："+this.name+","+"性别："+this.sex+","+"登陆状态:"+this.statue))
    }
    
}

module.exports = Players
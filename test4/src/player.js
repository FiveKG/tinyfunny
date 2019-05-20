let Send_rec_format = require('./send_rec_format')

class Player
{
    constructor({ id, name, sex },mongo=null)
    {
        this.id = id
        this.name = name
        this.sex = sex
        this.mongo = mongo
        this.send_rec_format = new Send_rec_format()

        //登录之后关联的连接
        this.sock = null

    }

    set_sock(sock)
    {
        this.sock = sock
    }


    //@param new_name<array>
    update_name(new_name)
    {
        let that = this
        this.name = new_name[0]

        this.save_db(function (err,res)
        {
           
            if(err)
            {
                console.log(err)
                throw err
            }

             //发包
            that.send_sock("update_name",1,'更名成功')
            console.log(`${that.sock.remoteAddress}:${that.sock.remotePort} 更名成功 `)
            
        })
    }

    //@param  pid<array>
    find_player(pid)
    {
        let that = this

        pid = parseInt(pid[0])
        this.mongo.find_one({_id:pid},function(err,res)
        {
            if(err)
            {
                console.log(err)
                throw err
            }
            
            //发包
            that.send_sock("find_player",1,res)
            console.log(`${that.sock.remoteAddress}:${that.sock.remotePort} 查找成功 `)
        })
    }

    //@param player<Player>
    delete_player()
    {
        //删除自己的player
        let that = this
        
        this.mongo.delete({_id:this.id},function(err,res){
            if(err)
            {
                console.log(err)
                throw err
            }
            //发包
            that.send_sock("delete_player",1,'删除成功')
            console.log(`${that.sock.remoteAddress}:${that.sock.remotePort} 删除成功 `)

            //退出登陆
            that.log_out() 
        })
    }

    //@param player<Player>
    log_out()
    {
        this.send_sock('log_out', 1, null)
        console.log(`${this.sock.remoteAddress}:${this.sock.remotePort} 登出成功 `)
        delete this
    }



    send_sock(...args)
    {
        this.send_rec_format.set(args[0], args[1], args[2])
        let send = this.send_rec_format.get()
        this.sock.write(JSON.stringify(send))
    }

    //序列化
    as_db()
    {
        return {
            _id: this.id,
            name: this.name,
            sex: this.sex,
        }
    }

    //保存player到数据库
    save_db(call_back)
    {
        let db = this.as_db()
        this.mongo.update({ _id: this.id }, { $set: db }, call_back)
    }



}
module.exports = Player
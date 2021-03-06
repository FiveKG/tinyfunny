let Mail = require('./mail')
class Mail_manager
{
    constructor(server)
    {   
        let mongo = server.mongo
        this.mongo = mongo

        this.cur_max_aid = null
        this.load_max_aid()
        this.send_rec_obj = server.send_rec_obj

        this.online = {}//存放已登陆玩家{playerid:sock}

    }

    //用于接收,登出
    on_data(option,data)
    {
        switch(option)
        {
            case 'send_mail':
                let receiver = data.receiver
                let sender = data.sender
                let send_time = data.send_time
                //如果在线就发送邮件通知
                if(this.online[receiver])
                {
                    let sock = this.online[receiver]
                    this.send_sock(sock,"receive_mail",1,`来自${sender}的新邮件。 ${send_time}`)
                }
                break
            default:
                break
        }
    }
    //获取id
    async load_max_aid()
    {
        let res =await this.mongo.find("max_id", {_id:"get_aid"})
        this.cur_max_aid = res[0].aid
    }

    async init_mail(sock)
    {
        if(sock.player)
        {
            let pid = Number.parseInt(sock.player.id)

            let mail = new Mail(pid,this.mongo)
            sock.mail = mail
            mail.set_sock(sock)

            mail.set_handler(this.on_data.bind(this))
            //添加在线账号进内存
            this.online[pid]=sock
            console.log(`邮件初始化成功：${Object.keys(this.online)}`)
        }
        else
        {
            console.log(`${sock.remoteAddress}:${sock.remotePort} 玩家为空,跳过init_mail`)
        }
    }


     //发包
    send_sock(sock,...args)
    {
        this.send_rec_obj.set(args[0], args[1], args[2])
        let send = this.send_rec_obj.get()
        sock.write(JSON.stringify(send))
    }
}

module.exports = Mail_manager
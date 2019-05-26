let Mail = require('./mail')
class Mail_manager
{
    constructor(server)
    {   
        let mongo = server.mongo
        this.mongo = mongo

        this.cur_max_aid = null
        this.load_max_aid()
        //this.send_rec_obj = server.send_rec_obj
    }

    //获取id
    async load_max_aid()
    {
        let res =await this.mongo.find("max_id", {_id:"get_aid"})
        this.cur_max_aid = res[0].aid
    }

    async log_in(sock)
    {
        if(sock.player)
        {
            let pid = Number.parseInt(sock.player.id)

            let mail = new Mail(pid,this.mongo)
            sock.mail = mail
            mail.set_sock(sock)
        }
    }

}

module.exports = Mail_manager
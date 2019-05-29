let Players_manager = require('./src/players_manager')
let Account_manager = require('./src/accounts_manager')
let Mail_manager = require('./src/mail_manager')
let Send_rec_format = require('./src/send_rec_format')
let Network = require('./src/network')
let MongoDB = require('./src/mongo')

class Server
{
    constructor()
    {
        this.send_rec_obj = new Send_rec_format()
        this.mongo = new MongoDB()
        this.network = new Network()
        this.network.set_handler(this.on_data.bind(this))
        this.accounts_manager = new Account_manager(this)
        this.players_manager = new Players_manager(this)
        this.mail_manager = new Mail_manager(this)
    }
    async on_data(data, sock)
    {
        let account = sock.account
        let player = sock.player
        let mail = sock.mail
         //没有登陆的状态
         if (!sock.account)
        {
            switch (data['operate'])
            {
                case 'register':
                    await this.accounts_manager.create_account(data['data'], sock)
                    break
                case 'log_in':
                    await this.accounts_manager.log_in(data['data'], sock)
                    await this.players_manager.init_player(sock)
                    await this.mail_manager.init_mail(sock)
                    break
                default:
                    break;
            }
        }

        //登陆阶段
        if (sock.account)
        {
            switch (data['operate'])
            {
                case 'create_player':
                    if(sock.player)//防止重复创建玩家
                    {
                        break
                    }
                    await this.players_manager.create_player(data['data'],sock)
                    await this.players_manager.init_player(sock)
                    await this.mail_manager.init_mail(sock)
                    await account.update_account('create_player')
                    break
                case 'log_out':
                    account.log_out()
                    break
                default:
                    break;
            }
        }

        //登陆且有玩家角色
        if(sock.account &&sock.player)
        {
            switch (data['operate'])
            {
                case 'delete_player':
                    mail.delete_all_mails()//清空邮箱
                    account.update_account('delete_player')//account.player =null
                    player.delete_player()
                    break
                case 'find_player':
                    player.find_player(data['data'])
                    break
                case 'update_name':
                    player.update_name(data['data'])
                    break
                case 'check_mail':
                    mail.check_mail(data['data'])
                    break
                case 'send_mail':
                    mail.send_mail(data['data'])
                    break
                case 'show_mail_detail':
                    mail.show_mail_detail(data['data'])
                    break
                case 'delete_mail':
                    mail.delete_one_mail(data['data'])
                    break
                default:
                    break;
            }
        }
    }

    listen_connect()
    {
        this.network.listen_connect()
    }
}

let server = new Server()
server.listen_connect()

let Players_manager = require('./src/players_manager')
let Account_manager = require('./src/accounts_manager')
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

        
        
    }
    async on_data(data, sock)
    {
         //没有登陆的状态
         if (!sock.account)
        {
            switch (data['operate'])
            {
                case 'register':
                await this.accounts_manager.create_account(data['data'], sock)
                await this.players_manager.create_player(data['data'], sock)
                    break
                case 'log_in':
                    this.accounts_manager.log_in(data['data'], sock)
                    this.players_manager.log_in(sock)
                    break
                default:
                    break;
            }
        }

        //登陆阶段
        if (sock.account)
        {
            let account = sock.account
            let player = sock.player

            switch (data['operate'])
            {
                case 'delete_player':
                    account.update_account('delete_player')
                    player.delete_player()
                    break
                case 'create_player':
                    this.players_manager.create_player(data['data'],sock)
                    account.update_account('create_player')
                    break
                case 'log_out':
                    player.log_out()
                    account.log_out()
                    break
                case 'find_player':
                    player.find_player(data['data'])
                    break
                case 'update_name':
                    player.update_name(data['data'])
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

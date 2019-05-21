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
        this.account_manager = new Account_manager(this)
        this.players_manager = new Players_manager(this)
        
    }

    listen_connect()
    {
        this.network.listen_connect()
    }
}

let server = new Server()
server.listen_connect()

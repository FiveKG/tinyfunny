let Manager = require('./src/manager')
let Network = require('./src/network')

class Server
{
    constructor()
    {
        this.network = new Network();
        this.manager = new Manager(this);
    }

    network_listener()
    {
        this.network.listener()
    }
}

let server = new Server()
server.network_listener()

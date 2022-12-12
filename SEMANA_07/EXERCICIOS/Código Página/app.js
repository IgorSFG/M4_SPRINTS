const express = require('express');
const bodyParser = require('body-parser');
const urlencoder = bodyParser.urlencoded({extended:false});
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server, {});
const port = 8000;
const hostname = '10.128.64.20';

app.use(express.json());

app.use('/client', express.static(__dirname + '/client'));

app.get('/', (req, res)=>{
    res.sendFile(__dirname + '/client/index.html');
});

var posted = "";
var countpost = 0;
app.post('/removed', urlencoder, (req, res)=>{
    var arrived = String(req.body.removed);
    if(arrived == "rmv") {posted = arrived; countpost=0;}
    else if(arrived == "none" && countpost >= 63){posted = arrived; countpost = 0;}
    res.send(posted);
    console.log(posted);
    console.log(countpost);
    countpost++;
});

//Server irá escutar na porta definida em 'port'
server.listen(port, hostname, () => {
	console.log(`Server running at http://${hostname}:${port}/`);
});

var socket_list = {};
var initPack = {player:[], laser:[]}
var removePack = {player:[], laser:[]}

var Entity = ()=>{
    let self = {
        x:450,
        y:300,
        id:"",
        speedX:0,
        speedY:0,
        direction:1
    }
    
    self.updatePosition =()=>{
        self.x += self.speedX;
        self.y += self.speedY;
    }

    self.hitbox =(px)=>{
        let distance = Math.sqrt(Math.pow(self.x-px.x,2) + Math.pow(self.y-px.y,2));
        return distance;
    }

    self.update = ()=>{
        self.updatePosition();
    }
    
    return self;
}

var Player = (id)=>{
    let self = Entity();
    self.id = id;
    self.number = Math.floor(16*Math.random());
    self.hpMax = 20;
    self.hp = self.hpMax;
    self.score = 0;
    self.left = false;
    self.right = false;
    self.up = false;
    self.down = false;
    self.shoot = false;
    self.Pspd = 10;

    self.updateSpeed = ()=>{
        if(self.left) self.speedX = -self.Pspd;
        else if(self.right) self.speedX = self.Pspd;
        else self.speedX = 0;
        if(self.up) self.speedY = -self.Pspd;
        else if(self.down) self.speedY = self.Pspd;
        else self.speedY = 0;
    }

    self.shootLaser = (parent, direction)=>{
        let laser = Laser(parent, direction);
        laser.x = self.x;
        laser.y = self.y;
    }

    let super_update = self.update;
    self.update = ()=>{
        self.updateSpeed();
        if(self.shoot) self.shootLaser(self.id, self.direction);
        super_update();
    }

    self.getInitPack = ()=>{
        return {
            x:self.x,
            y:self.y,
            id:self.id,
            number:self.number,
            hpMax:self.hpMax,
            hp:self.hp,
            score:self.score
        }
    }

    self.getUpdatePack = ()=>{
        return {
            x:self.x,
            y:self.y,
            id:self.id,
            hp:self.hp,
            score:self.score
        }
    }

    Player.list[id] = self;
    initPack.player.push(self.getInitPack());
    return self;
}
Player.list = {};

Player.getAllInitPack = ()=>{
    var players = [];
    for(let i in Player.list){
        players.push(Player.list[i].getInitPack());
    }
    return players;
}

Player.update = ()=>{
    var pack = [];
    for(let i in Player.list){
        var playerl = Player.list[i];
        playerl.update();
        pack.push(playerl.getUpdatePack());
    }
    return pack;
}

var Laser = (parent, direction)=>{
    let self = Entity();
    self.x = -600;
    self.y = -600;
    self.id = Math.random();
    self.direction = direction;
    self.speedX = direction*15;
    self.parent = parent;
    self.timer = 0;
    self.remove = false;

    let super_update = self.update;
    self.update = ()=>{
        if(self.timer++ > 100) self.remove = true;
        for(let i in Player.list){
            let pl = Player.list[i];
            if(self.hitbox(pl) < 16 && self.parent != pl.id){
                pl.hp--;
                let shooter = Player.list[self.parent];
                if(shooter) shooter.score += 5;
                if(pl.hp <= 0){
                    shooter.score += 100;
                    Player.onDisconnect(pl);
                }
                
                self.remove = true;
            }
        }
        super_update();
    }

    self.getInitPack = ()=>{
        return {
            x:self.x,
            y:self.y,
            id:self.id,
        }
    }

    self.getUpdatePack = ()=>{
        return {
            x:self.x,
            y:self.y,
            id:self.id,
        }
    }
    
    Laser.list[self.id] = self;
    initPack.laser.push(self.getInitPack());
    return self;
}
Laser.list = {};

Laser.getAllInitPack = ()=>{
    var lasers = [];
    for(let i in Laser.list){
        lasers.push(Laser.list[i].getInitPack());
    }
    return lasers;
}

Laser.update = ()=>{
    var pack = [];
    for(let i in Laser.list){
        var laserl = Laser.list[i];
        laserl.update();
        if(laserl.remove){
            delete laserl;
            removePack.laser.push(laserl.id);
        }
        else pack.push(laserl.getUpdatePack());
    }
    return pack;
}

Player.onConnect = (socket)=>{
    var socket_player = Player(socket.id);
    
    socket.on('keyPress', (data)=>{
        //Movimentar
		if(data.inputId === 'left'){
            socket_player.left = data.state;
            socket_player.direction = -1;
        }
		else if(data.inputId === 'right'){
            socket_player.right = data.state;
            socket_player.direction = 1;
        }
        else if(data.inputId === 'up'){
            socket_player.up = data.state;
        }
        else if(data.inputId === 'down'){
            socket_player.down = data.state;
        }

        //Atirar
		if(data.inputId === 'shoot')
        socket_player.shoot = data.state;
	});

    socket.emit('init', {
        player:Player.getAllInitPack(),
        laser:Laser.getAllInitPack()
    });
}

Player.onDisconnect = (socket)=>{
    removePack.player.push(socket.id);
    delete Player.list[socket.id];
}

var ident = 0;
io.on('connection', (socket)=>{
    console.log('socket connection');
    socket.id = ident++;
    socket_list[socket.id] = socket;
    Player.onConnect(socket);

    socket.on('disconnect', ()=>{
        console.log('socket disconnection');
        Player.onDisconnect(socket);
        delete socket_list[socket.id];
    });
});

setInterval(()=>{
    var pack = {
        player:Player.update(),
        laser:Laser.update(),
    }
    
    for(let i in socket_list){
        var socket = socket_list[i];
        socket.emit('init', initPack);
        socket.emit('update', pack);
        socket.emit('remove', removePack);
    }

    initPack.player = [];
    removePack.player = [];
    initPack.laser = [];
    removePack.laser = [];
},40);
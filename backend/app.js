const express = require('express');
const cors = require('cors')
const fs = require('fs');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

const usuarios = JSON.parse(fs.readFileSync('./users.json'));
const eventos = JSON.parse(fs.readFileSync('./events.json'));
const invitations = JSON.parse(fs.readFileSync('./eventsInvitations.json'));

const app = express();

const jsonParser = bodyParser.json();
const urlencodedParser = bodyParser.urlencoded({ extended: false })

app.use(cookieParser());
app.use(cors({credentials: true, origin: 'http://localhost:8080'})); //habilitando cors na nossa aplicacao

const privatekey = fs.readFileSync('./jwtRS256.key')

app.get('/', (req, res) => res.send("Hello World"))


//function validToken(req, res, next){
// 
//}
app.post('/regUser', urlencodedParser, (req, res) => {
    const form = req.body;

    console.log(form)
    let userSearch = usuarios.slice()
    
    userSearch = userSearch.filter(element => {
        return element.username == form.username;
    });
    

    if(userSearch.length == 0 ){
        usuarios.push({name: form.name, username: form.username, password: form.password, userType: "user"})
        
        fs.writeFileSync('./users.json', JSON.stringify(usuarios));
        res.sendStatus(201);
    }else{
        res.sendStatus(401);
    }
   
}) 

app.post('/regUser', urlencodedParser, (req, res) => {
    const form = req.body;

    console.log(form)
    let userSearch = usuarios.slice()
    
    userSearch = userSearch.filter(element => {
        return element.username == form.username;
    });
    

    if(userSearch.length == 0 ){
        usuarios.push({name: form.name, username: form.username, password: form.password, userType: "user"})
        
        fs.writeFileSync('./users.json', JSON.stringify(usuarios));
        res.sendStatus(201);
    }else{
        res.sendStatus(401);
    }
   
}) 

app.post('/regEvent', urlencodedParser, (req, res) => {
    const form = req.body;

    console.log(form)
    let eventSearch = eventos.slice()
    
    eventSearch = eventSearch.filter(element => {
        return element.title == form.title;
    });

    if(eventSearch.length == 0 ){
        eventos.push({title: form.title, description: form.description, date: form.date, datetime: form.datetime})
        fs.writeFileSync('./events.json', JSON.stringify(eventos));
        res.sendStatus(201);
    }else{
        res.sendStatus(401);
    }
   
}) 

app.post('/login', jsonParser, (req, res) => {
    const form = req.body;

    usuarios.forEach(element => {
        if(element.username == form.username && element.password == form.password){
            res.cookie("login", "true");
            if(element.userType == "adm"){
                res.cookie("loginType", "adm");
            }

            const token = jwt.sign(
                { 
                    username: element.username,
                    userType: element.userType, 
                }, 
                    privatekey, 
                    { algorithm: 'RS256' },
                { expiresIn: 60 * 5 }
            );
            res.cookie("token", token)
	        res.send(true);
        }
    });
    res.status(401).send('Login inválido!');
    
})  

app.post('/getcookie', jsonParser,function(req, res) {
    jwt.verify(req.cookies.token, privatekey, {algorithms: 'RS256'}, function(err, decoded) {
        if(err){    
            res.send(false);  
        }else{
            res.send(true);  
        }
    })
});

app.post('/checkAdm', jsonParser,function(req, res) {
    jwt.verify(req.cookies.token, privatekey, {algorithms: 'RS256'}, function(err, decoded) {
        if(decoded.userType == 'adm'){
            res.send(true);   
        }else{
            res.send(false);  
        }
    })
});

app.get('/logout', (req, res) => {
    res.clearCookie("login");
    res.clearCookie("loginType");
    res.clearCookie("token");
	res.send('Cookie has been deleted')
});

app.get('/showUsers', (req, res) => {
    res.send(usuarios);
});

app.get('/showEvents', (req, res) => {
    res.send(eventos);
});

app.get('/showEvent/:id', (req, res) => {
    res.send(eventos[req.params.id]);
});

app.post('/genQr', jsonParser, (req, res) => {
    let eventData
    jwt.verify(req.cookies.token, privatekey, {algorithms: 'RS256'}, function(err, decoded){
        if(!err){
            eventData = jwt.sign (
                {
                    username: decoded.username,
                    eventId: req.body.id,
                    eventName: eventos[req.body.id].title
                }, 
                privatekey, 
                { algorithm: 'RS256' },
                { expiresIn: 60 * 5 }
            )
            invitations.push(eventData);
            fs.writeFileSync('./eventsInvitations.json', JSON.stringify(invitations));
        }
    });
    res.json(`Event Registered`);   
})

app.post('/showQr', jsonParser, (req, res) => {
    let userData;
    let userEvent;
    jwt.verify(req.cookies.token, privatekey, {algorithms: 'RS256'}, function(err, decoded){
        if(!err) userData = decoded;
    })
    invitations.forEach((element, index)=> {
        jwt.verify(element, privatekey, {algorithms: 'RS256'}, function(err, decoded){
            console.log(decoded)
            console.log(userData)
            console.log(req.body.id)
            if(decoded.username == userData.username && decoded.eventId == req.body.id){
                userEvent = invitations[index];
            }
        })
    })
    if(typeof userEvent != "undefined"){
        res.json(`http://localhost:8000/readQr/${userEvent}`);  
    }else{
        res.sendStatus(404)
    }
})



app.get('/readQr/:token', jsonParser, (req, res) => {
    const userEvent = req.params.token;
    let inv = false

    invitations.forEach((element, index) => {
        if(element == userEvent){
            invitations.splice(index, 1)
            return inv = true;
        }
    })

    if(inv == true ){
        fs.writeFileSync('./eventsInvitations.json', JSON.stringify(invitations));
        res.send({result: "accepted"});
    }else{
        res.send({result: "dennied"});
    }
        
});

const server = app.listen(8000, () => { 
    console.log("http://localhost:8000");
});
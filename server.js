require('./config');

const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const hbs = require('hbs');
const fs = require('fs');
const _ = require('lodash');

const {mongoose} = require('./db/mongoose');

const {Software} = require('./models/software');
const {Location} = require('./models/location');
const {Device} = require('./models/device');
const {User} = require('./models/user');

const {authenticate} = require('./utils/authenticate');
const {adminAuth} = require('./utils/authenticate');
const setup = require('./utils/setup');

const port = process.env.PORT || 3000;
var app = express();
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));
app.use(cookieParser());

hbs.registerPartials(__dirname+'/views/parts');
app.set('view engine', 'hbs');
app.use(express.static(__dirname+'/public'));

app.use((request, response, next)=>{
  var now = new Date().toString();
  var log = `Connection at ${now}: ${request.method} ${request.url}`;
  console.log(log);
  fs.appendFile('server.log', log + '\n', (err)=>{
    if (err){
      console.log('Unable to append to server log');
    }
  })
  next();
});

hbs.registerHelper('getCurrentYear', ()=>{
  return new Date().getFullYear();
});
hbs.registerHelper('allCaps', (text)=>{
  return text.toUpperCase();
})
hbs.registerHelper('stringify', (object)=>{
  let str = JSON.stringify(object);
  return new hbs.SafeString(str);
});

app.get('/admin',adminAuth, (req, res)=>{
  User.find().then((users)=>{
    res.render('controlpanel.hbs', {users});
  }).catch((err)=>{
    console.log(err);
    res.status(500).send();
  });
})

app.get('/admin/reset/all', adminAuth, (req,res)=>{
  setup.newGame().then(()=>{
    res.send()
  }).catch((err)=>{
    console.error('[!] New Game Error');
    console.error(err);
  })
})

app.get('/admin/reset',adminAuth, (req,res)=> {
  User.find().then((users)=>{
    for(var i=0;i<users.length;i++){
      try{
        users[i].newPlayer()
      } catch {
        throw "Database Error"
      }
    }
  }).catch((err)=>{
    console.error(err);
    res.status(500).send('Errors occured during reset')
  }).then(()=>{
    res.send('Successfully reset all players');
  })
})

app.get('/signup', (req, res)=> {
  res.render('signup.hbs');
})

app.post('/signup', (req, res)=> {
  let body = _.pick(req.body, ['username','password','email','displayName']);

  let newUser = new User(body);
  newUser.save().then(()=>{
    return newUser.generateAuthToken()
  }).then((token)=>{
    res.header('x-auth', token).send(token)
  }).catch((err)=>{
    console.error(err);
    res.status(400).send(err);
  })
})

app.get('/login', (req,res)=>{
  res.render('login.hbs');
})

app.post('/login', (req,res)=>{
  var body = _.pick(req.body, ['username', 'password']);

  User.findByCreds(body.username, body.password).then((user)=>{
    return user.generateAuthToken().then((token)=>{
      res.set('x-auth', token).send(token);
    })
  }).catch((err)=>{
    res.status(400).send();
  })
})

app.post('/game/equipment/:xuid', authenticate, (req,res)=>{
  let {input} = req.body;
  let user = req.user;
  let xuid = req.params.xuid;
  Device.findByXuid(xuid).then((device)=>{
    res.send('++++' +input+ '++++')
  }).catch((err)=>{
    res.status(500).send()
  })
})

app.get('/game/equipment/:xuid', authenticate, (req,res)=>{
  let user = req.user;
  let xuid = req.params.xuid;
  Device.findByXuid(xuid).then((device)=>{
    res.render('console.hbs', {user,device})
  }).catch((err)=>{
    res.status(500).send()
  })
})

app.get('/game/location/equipment', authenticate, (req,res)=>{
  var xuid = req.user.currentLocation;
  Location.findByXuid(xuid).then((location)=> {
    res.render('equipment-menu.hbs', {location});
  }).catch((err)=>{
    res.status(500).send()
  })
})

app.get('/game/location/:xuid', authenticate, (req,res)=>{
  let xuid = req.params.xuid;
  var user = req.user;
  Location.findByXuid(xuid).then((location)=> {
    user.currentLocation = xuid;
    user.save().then(()=>{
      res.render('location.hbs', {user, location});
    })
  })

})

app.get('/game/location', authenticate, (req,res)=> {
  let user = req.user;
  console.log(user.locations);
  res.render('location-menu.hbs', {user});
})

app.get('/game', authenticate, (req,res)=> {
  let user = req.user;
  res.render('game.hbs', {user});
})


app.get('/', (request, response)=>{
  // response.send('<button>Hello World</button>');
  response.render('index.hbs', {
    pageTitle: 'Home',
    currentYear: new Date().getFullYear()
  });
});

app.get('*', (req, res)=> {
  res.status(404);
  res.render('404.hbs');
})

app.listen(port, ()=>{
  console.log(`Server Listening on port ${port}`);
}); //port

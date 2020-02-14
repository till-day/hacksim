var {User} = require('./../models/user');


var authenticate = (req, res, next) =>{
  var token = req.header('x-auth');
  if (!token){
    token = req.cookies.token;
  }

  User.findByToken(token).then((user)=>{
    if(!user){
      return Promise.reject();
    }
    req.user = user;
    req.token = token;
    next();
  }).catch((err)=>{
    res.status(401).send(err);
  })
}

var adminAuth = (req,res,next)=>{
  var token = req.header('x-auth');
  if (!token){
    token = req.cookies.token;
  }

  User.findByToken(token).then((user)=>{
    if(!user){
      return Promise.reject();
    }
    if(!user.admin){
      res.status(403).send();
    }

    req.user = user;
    req.token = token;
    next();
  }).catch((err)=>{
    res.status(401).send(err);
  })
}

module.exports = {authenticate, adminAuth};

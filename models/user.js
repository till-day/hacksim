const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');
const {Location} = require('./location');
const {Software} = require('./software');
const {Device} = require('./device');
const {getXuid} = require('../utils/xuid');

var UserSchema = new mongoose.Schema({
  displayName: {
    type: String,
    required: true,
    minlength: 1
  },
  username: {
    type: String,
    required: true,
    unique: true,
    minlength: 1
  },
  email: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: '{VALUE} is not a valid email.'
    }
  },
  password: {
    type: String,
    required: true,
    trim: true,
    minlength: 8,
  },
  locations: [{
    displayName: String,
    xuid: String
  }],
  currentLocation: String,
  messages: [{
    from: String,
    message: String,
    read: {
      type: Boolean,
      default: false
    }
  }],
  lastLogin: Date,
  tokens:[{
    access: {
      type: String,
      required: true,
    },
    token: {
      type: String,
      required: true
    }
  }],
  admin: {
    type: Boolean,
    default: false
  }
})


UserSchema.methods.toJSON = function(){
  var user = this;
  var userObject = user.toObject();

  return _.pick(userObject, ['_id', 'username', 'email']);
}

UserSchema.methods.generateAuthToken = function(){
  var user = this;
  var access = 'auth';
  var token = jwt.sign({_id: user._id.toHexString(), access}, process.env.JWT_SECRET);

  // user.tokens.push({access, token});
  user.tokens = {access, token}
  // user.tokens = user.tokens.concat([{access,token}]);

  return user.save().then(()=>{
    return token;
  })
}

UserSchema.methods.removeToken = function(token){
  var user = this;
  try {
    return user.update({
      $pull: {
        tokens: {token}
      }
    });
  } catch (e) {
    return `[!] ERROR :: \n${e}`;
  }
;}

UserSchema.statics.findByCreds = function(username, password){
  return User.findOne({username}).then((user)=>{
    if(!user){
      return Promise.reject();
    }
    return new Promise((resolve, reject)=>{
      bcrypt.compare(password, user.password, (err, result)=>{
        if(result){
          resolve(user);
        } else {
          reject();
        }
      });
    });
 });
};

UserSchema.methods.dropLocations = function(){
  let user = this;
  user.locations = [];
  return user.save()
}

UserSchema.methods.newPlayer = function(){
  let user = this;
  let software = new Software()
  software.save().then(()=>{
    let pc = new Device({
      displayName: 'Home-PC',
      software: software,
      wireless: false,
      wired: true,
      airplaneMode: false,
      portable: false,
      battery: false,
      charge: 0,
      chargeCapacity: 0,
      powerConsumption: 0,
      xuid: getXuid()
    });
    pc.save().then(()=>{
      let freshLocation = new Location({
        category:'Private',
        displayName: 'Home',
        wifi: false,
        ethernet: true,
        electricity: true,
        equipment: [{
          displayName: pc.displayName,
          xuid:pc.xuid
        }],
        xuid: getXuid()
      });
      freshLocation.save().then(()=>{
        Location.getPublic().then((public)=>{
          var locArray = [];
          console.log(public.length);
          for(var i=0;i<public.length;i++){
            let loc = {
              displayName: public[i].displayName,
              xuid: public[i].xuid
            };
            locArray.push(loc)
          }

          var userLoc = {
            displayName: freshLocation.displayName,
            xuid: freshLocation.xuid
          };
          locArray.push(userLoc);
          user.locations = locArray;
          user.save().then(()=>{
            return
          }).catch((err)=>{
            console.error(err);
            throw err
          })
        }).catch((err)=>{
          console.error(err);
          throw err
        });

      }).catch((err)=>{
        console.error(err);
        throw err
      })
    })
  })
}

UserSchema.statics.findByToken = function(token){
  var User = this;
  var decoded;

  try{
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch(err){
    return new Promise((resolve, reject)=>{
      reject();
    })
  }
  return User.findOne({
    '_id': decoded._id,
    'tokens.token': token,
    'tokens.access': 'auth'
  })
}

UserSchema.pre('save', function (next){
  var user = this;
  if(user.isModified('password')){
    bcrypt.genSalt(10, (err, salt)=>{
      bcrypt.hash(user.password, salt, (err, hash)=>{
        user.password = hash;
        next();
      })
    })
  } else {
    next();
  }
})

var User = mongoose.model('User', UserSchema);

module.exports = {User};

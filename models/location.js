const mongoose = require('mongoose');
const {getXuid} = require('../utils/xuid');

var LocationSchema = new mongoose.Schema({
  category: String,
  displayName: String,
  wifi: Boolean,
  ethernet: Boolean,
  electricity: Boolean,
  wireless_devices: Array,
  wired_devices: Array,
  equipment: [{displayName: String, xuid:String}],
  xuid: {type:String, default: getXuid()},
  people: [{displayName: String, xuid:String}]
})

LocationSchema.methods.getKey = function(){
  var location = this;
  return {
    displayName: location.displayName,
    xuid: location.xuid
  }
}

LocationSchema.statics.findByXuid = function(xuid){
  var Location = this;
  return Location.findOne({
    'xuid': xuid,
  })
}

LocationSchema.statics.getPublic = function(){
  var Location = this;
  return Location.find({
    'category': 'Public'
  })
}

LocationSchema.statics.startLocation = async function(){
  var Location = this;
  Location.findOne({
    'category': 'Public',
  }).then((location)=>{
    let min = {
      displayName: location.displayName,
      xuid: location.xuid
    };
    return min;
  })
}

//LocationSchema.methods.genPrivate = function(name){}

var Location = mongoose.model('Location', LocationSchema);

module.exports = {Location};

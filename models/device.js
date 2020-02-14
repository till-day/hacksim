const mongoose = require('mongoose');
const {getXuid} = require('../utils/xuid');
const {Software} = require('../models/software');

var DeviceSchema = new mongoose.Schema({
  displayName: {type: String, default: 'Computer'},
  public_ip: String,
  private_ip: String,
  software: Object,
  gpu: {type:Number,default:1},
  cpu: {type:Number,default:1},
  ram: {type:Number,default:1},
  storageCapacity: {type:Number,default:20},
  storage: Array,
  wireless: Boolean,
  wifi_adapter: Number,
  infections: Array,
  attacks: Array,
  location: String,
  wired: Boolean,
  airplaneMode: Boolean,
  portable: Boolean,
  battery: Boolean,
  charge: Number,
  chargeCapacity: Number,
  powerConsumption: Number,
  xuid: {type:String, default:getXuid()}
})

DeviceSchema.statics.findByXuid = function(xuid){
  var Device = this;
  return Device.findOne({
    'xuid': xuid,
  })
}

DeviceSchema.methods.getKey = function(){
  var device = this;
  return {
    displayName: device.displayName,
    xuid: device.xuid
  }
}

DeviceSchema.methods.genDesktop = function(name){
  let software = new Software();
  software.save().then(()=>{
    var pc = new Device({
      displayName: name,
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
    var equipment={
      displayName: pc.displayName,
      xuid: pc.xuid
    };
    pc.save().then(()=>{
      // console.log('saved pc');
      console.log(equipment);
      return equipment
    }).catch((err)=>{
      console.error(`[-] Error saving ${name}`);
      console.error(err);
      throw err
    })
  }).catch((err)=>{
    console.error(`Error saving software:`)
    console.error(err);
    throw err
  })
}

var Device = mongoose.model('Device', DeviceSchema);

module.exports = {Device};

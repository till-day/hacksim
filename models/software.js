const mongoose = require('mongoose');
const {getXuid} = require('../utils/xuid');

var SoftwareSchema = new mongoose.Schema({
  firewall: {type:Number,default:2},
  patch: {type:Number,default:0},
  encryption: {type:Number,default:0},
  antivirus: {type:Number,default:2},
  scanner: {type:Number,default:0},
  cracker: {type:Number,default:0},
  rainbow_table: {type:Number,default:0},
  exploit: {type:Number,default:0},
  injector: {type:Number,default:0},
  virus: {type:Number,default:0},
  worm: {type:Number,default:0},
  spyware: {type:Number,default:0},
  ransomeware: {type:Number,default:0},
  rootkit: {type:Number,default:0},
  miner: {type:Number,default:0},
  xuid: {type: String, default: getXuid()}
})

var Software = mongoose.model('Software', SoftwareSchema);

module.exports = {Software};

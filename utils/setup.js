const {User} = require('../models/user');
const {Location} = require('../models/location');
const {Software} = require('../models/software');
const {Device} = require('../models/device');
const {getXuid} = require('./xuid');

var dropPublic = () => {
  return Location.deleteMany({category:'Public'})
}

var clearUserLocations = async () => {
  User.find().then((users)=>{
    for(let i=0;i<users.length;i++){
      users[i].dropLocations()
    }
  })
}

var generateDevices = async function(count){
  let equipment = []
  for(var i=0;i<count;i++){
    let n = i + 1
    displayName = `Computer-${n}`
    let pc = new Device();
    pc.save().then(()=>{
      pc.genDesktop(displayName).then((pcID)=>{
        console.log(pcID);
        equipment.push(pcID);
      })
    })
  }
  // console.log(equipment);
  return equipment
}


var begin = async function() {
  var count = 2;
  let equipment = await generateDevices(count);
  let library = new Location({
    category: 'Public',
    displayName: 'Library',
    wifi: true,
    ethernet: true,
    electricity: true,
    equipment:  equipment,
    xuid: getXuid()
  });

  if(library.equipment.length == count){
    library.save()
  } else {
    console.error(library.equipment);
  }
}

var newGame = async function() {
  clearUserLocations().then(()=>{
    dropPublic().then(()=>{
      User.find().then((users)=>{
        for(var i=0;i<users.length;i++){
          try{
            users[i].newPlayer()
          } catch {
            throw "Database Error"
          }
        }
      })
      .then(()=>{
        return begin()
      })
      .catch((err)=>{
        console.error(err);
        throw false
      })
    })
  })
}

module.exports = {newGame};

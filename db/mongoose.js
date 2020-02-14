var mongoose = require('mongoose');

// const url = process.env.MONGODB_URI;
const url =  'mongodb://127.0.0.1/hacksim';
mongoose.Promise = global.Promise;
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true  }).catch((err)=>{
  console.log('[!] MongoDB not found. Are you sure its running?');
  process.exit();
});
mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);

module.exports = {mongoose}; // Dont forget that in ES6 {name} == {name: name}

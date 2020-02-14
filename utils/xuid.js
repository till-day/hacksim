const getXuid = ()=> {
  var xuid = '';
  xuid = randomString(8)+'-';
  xuid += randomString(4)+'-';
  xuid += randomString(4)+'-';
  xuid += randomString(4)+'-';
  xuid += randomString(12);

  return xuid;
}

const randomString = (x)=> Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, x)

module.exports = {getXuid};

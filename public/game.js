function grabGet(route){
  var xhttp = new XMLHttpRequest();
  xhttp.open("GET", route, false);
  xhttp.send();
  if(xhttp.status == 200){
    updatePage(xhttp.responseText)
  } else {
    console.error(xhttp.responseText)
  }
}

function updatePage(data){
  $('#main-pane').html(data)
}

function route(string, option){
  var route = '';
  switch(string){
    case 'inventory':
      route = '/game/inventory';
      break
    case 'location':
      route = '/game/location';
      break
    case 'equipment':
      route = '/game/location/equipment';
      break
    case 'device':
      route = '/game/equipment';
      break
  }
  if(option){
    route += '/'+option;
  }

  if(route != ''){
    grabGet(route)
  } else {
    console.error('[666] Not Implemented')
  }
}
if($("#console")){
  $("#console").on('keyup', function (e) {
      if (e.keyCode === 13) {
          let input = $("#console").val();
          $("#screen").append('['+user.username+']$ '+input+'<br>');
          let route = '/game/equipment/'+device.xuid;
          $.post(route, {input}, function(resp) {
            $("#screen").append(resp+'<br>');
          });
          $("#screen").scrollTop($("#screen")[0].scrollHeight);
          $("#console").val('');
      }
  });
}

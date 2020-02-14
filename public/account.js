function signup(){
  let username = $('#username').val();
  let displayName = $('#displayName').val();
  let email = $('#email').val();
  let email2 = $('#email2').val();
  let password = $('#password').val();
  let password2 = $('#password2').val();

  let error = '';
  if(email !== email2){
    error += '<p>Emails do not match</p>'
  }
  if(password !== password2){
    error += '<p>Passwords do not match</p>'
  }
  if(error == ''){
    var user = {username, displayName, password, email};
    var posting = $.post("/signup", user, (token)=>{
      $.ajax({
        url : '/game',
        headers: {
        'x-auth' : token
        }
      }).done((data)=>{
        $('body').html(data);
      });
      setCookie('token',token,1);
    }).done(()=>{
      // window.location.href = '/game';
    }).fail((err)=>{
      error += err.errors
    }).always(()=>{
      $('#error').html(error)
    })
  }
  $('#error').html(error)
}

function login(){
  let username = $('#username').val();
  let password = $('#password').val();

  let error = '';
  if(username == ''){
    error += '<p>Username is required</p>'
  }
  if(password == ''){
    error += '<p>Password is required</p>'
  }
  if(error == ''){
    var user = {username,password};
    var posting = $.post("/login", user, (token)=>{
      $.ajax({
        url : '/game',
        headers: {
        'x-auth' : token
        }
      }).done((data)=>{
        $('body').html(data);
      });
      setCookie('token',token,1);
    }).done(()=>{
      // window.location.href = '/game';
    }).fail((err)=>{
      error += err.errors
    }).always(()=>{
      $('#error').html(error)
    })
  }

  $('#error').html(error)
}

function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
  var expires = "expires="+ d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function reset(){
  //Do someting
}

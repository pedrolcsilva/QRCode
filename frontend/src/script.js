
let timeoutID = 0;
const apiURL = "http://localhost:8000/"
try {
  fetch(apiURL + 'getcookie/', {
    method: 'POST',
    credentials: "include",
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    }
  })
  .then(response => {
    console.log(response)
    
    if (!response.ok) {
      return new Error('falhou a requisição') 
    }

    if (response.status === 401) {
      return new Error(response);
    }

    if(response.status == 201){
      console.log("Request complete! response:", response);
    }   
    return response.json();
  })
  .then(text => {
      console.log(text)
      if(text == true){
        window.location.href = '/homePage';
      }
  })

  .catch(function(error) {
    console.log('Request failed', error);
  });
}
catch (e) {
}



document.getElementById("log").addEventListener('submit', function(e) {
  e.preventDefault();

  const username = document.getElementsByName("username")[0].value;
  const password = document.getElementsByName("password")[0].value;
  login(username, password);
    
})

async function login(username, password){

  const options = {
    method: 'POST',
    credentials: "include",
    body: JSON.stringify({ username: username, password: password}),
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    }
  }
  let userType = 0
  
  await fetch(apiURL + 'login/', options)
  .then(response => {

    // verificando pelo status
    if (response.status === 401) {
      return new Error(response);
    }

    if(response.status == 201){
      console.log("Request complete! response:", response);
    }   
    return response.json();
  })
  .then(text => {
    if(text == true){
      document.getElementById('modal2').innerHTML = "Login executado com sucesso!";
      userType = 1
    }else{  
      document.getElementById('modal2').innerHTML = "Seu nome ou senha está incorreto";
    }
  })

  .catch(function(error) {
    console.log('Request failed', error);
  });


  await fetch(apiURL + 'checkAdm/', {
    method: 'POST',
    credentials: "include",
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    }
  })
  .then(response => {
    return response.json();
  })
  .then(text => {
      console.log(text)
      if(text == true){
        userType = 2;
        console.log(userType);
      }
  })

  .catch(function(error) {
    console.log('Request failed', error);
  });
  if(userType == 1){
    window.location.href = '/homePage';
  }else if(userType == 2){
    window.location.href = '/admPage';
  }

}
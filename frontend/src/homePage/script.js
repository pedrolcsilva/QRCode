const apiURL = "http://localhost:8000/"
let esc;

async function checkLogin(){
  try {
    await fetch(apiURL + 'getcookie/', {
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
        if(text != true){
          window.location.href = '/';
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
          window.location.href = '/admPage';
        }
    })

    .catch(function(error) {
      console.log('Request failed', error);
    });
  }
  catch (e) {
    console.log(e);
  }
}

checkLogin();

async function showEvents(){
  try{
    await fetch(apiURL + 'showEvents', {
      method: 'GET',
      credentials: "include",
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      }
    })
    .then(response => {
      return response.json()
    })
    .then(data => {
      console.log(data);
      data.forEach((element, index) => {
        document.getElementsByName('select')[0].innerHTML += (`
        <option value="valor${index}">${element.title}</option>
        `);
        
      });
    })
    .catch(err => {
      console.log(err);
    })
  } catch (e){
    console.log(e);
  } 
}

showEvents();


document.getElementById("logout").addEventListener('click', () => {
    fetch(apiURL + 'logout/', {method: 'GET',
      credentials: "include",
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
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
      return response.text();
    })
    .then(text => {
      console.log(text)
      window.location.href = '/';
      
    })

    .catch(function(error) {
      console.log('Request failed', error);
    });
})

document.getElementsByName('select')[0].addEventListener('change', async function(){
  esc = this.value.replace(/[^\d]+/g,'')
  console.log(esc)
  if(esc != ""){

    await fetch(apiURL + `showEvent/${esc}`, {
      method: 'GET',
      credentials: "include",
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      }
    })
    .then(response => {
      return response.json()
    })
    .then(data => {
      console.log(data);
      document.getElementById('eventTab').style.display = "block";

      document.getElementById('eventTab').innerHTML = `
      <p>Evento: ${data.title}</p>
      <p>Descrição: ${data.description}</p>
      <p>Data: ${data.date}</p>
      <p>Hora: ${data.datetime}</p>
      `;
    })
    .catch(err => {
      console.log(err);
    })

  }else{
    document.getElementById('eventTab').style.display = "none";
  }
});

document.getElementById('cad').addEventListener('click', function (){
  fetch(apiURL + `genQr/`, {
    method: 'POST',
    credentials: "include",
    body: JSON.stringify({ id: esc}),
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    }
  })
  .then(response => {
    return response.json()
  })
  .then(data => {
    console.log(data);
  })
  .catch(err => {
    console.log(err);
  })
})

document.getElementById('qrcode').addEventListener('click', function (){
  fetch(apiURL + `showQr/`, {
    method: 'POST',
    credentials: "include",
    body: JSON.stringify({ id: esc}),
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    }
  })
  .then(response => {
    return response.json()
  })
  .then(data => {
    console.log(data);
    if(document.getElementById('qrc').style.display == "none"){
      document.getElementById('qrc').style.display = "block";
    }else{
      document.getElementById('qrc').style.display = "none";
    }
    let qr = qrcode(0, "L");
    qr.addData(JSON.stringify(data));
    qr.make();
    document.getElementById('qrc').innerHTML = qr.createSvgTag();
  })
  .catch(err => {
    document.getElementById('qrc').style.display = "none";
    console.log(err);
  })
})
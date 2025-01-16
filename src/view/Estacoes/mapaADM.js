window.onload = function() {
    const token = localStorage.getItem("token");
    console.log("token:", token);

    // Se o token não estiver presente, redireciona para a página de bicicletas
    if (!token) {
        window.location.href = "./bicicletas.html"; // Redireciona para a página de login
    }

    const payload = JSON.parse(atob(token.split(".")[1])); // Decodifica o payload
console.log(payload.tipo); 

    if (payload.tipo === "Comum" || payload.tipo === "Administrador Geral" ) {
        window.location.href = "../Bicicletas/bicicletas.html"; // Redireciona para a página de login
    } 
    else {
     console.log("Bem vindo administrador")
    }
};


//API Leaflet
var map = L.map('map').setView([-6.88, -38.58], 13);
const grupoMarcadores = L.layerGroup().addTo(map);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

var iconeVermelho = L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/252/252025.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
});

var marcadorEstacao = L.marker([40.5, -0.09], { icon: iconeVermelho} ).addTo(grupoMarcadores);

function onMapClick(e) {
    if(marcadorEstacao._mapToAdd == null){
        marcadorEstacao.addTo(grupoMarcadores);
    }
    marcadorEstacao.setLatLng(e.latlng);
}

map.on('click', onMapClick);

//Comunicacao com o banco de dados
//Infelizmente CORS e um monte de outras politicas obrigam a fazer tudo num unico script

const ehAdmin = true;

async function deletarEstacao(id){
    try{
        const resposta = await fetch(`http://localhost:3000/estacao/${id}`, {
            method: "DELETE",
        });

        if (!resposta.ok) {
            const mensagem = `Erro: ${resposta.status} - ${resposta.statusText}`;
            alert(`Falha ao deletar a estação. ${mensagem}`);
            return;
        }
    }
    catch(erro){
        alert("Deu algum erro");
    }
}

async function criadorBotaoDeletar(id) {
    await deletarEstacao(id);
    await receberMarcadores();
}

async function receberMarcadores(){
    try{
        grupoMarcadores.clearLayers();
        const resposta = await fetch("http://localhost:3000/estacao", {
            method: "GET",
        })

        const dados = await resposta.json();

        for(let i=0; i<dados.message.length; i++){
            const endereco = dados.message[i].localizacao.coordinates;
            let temp = L.marker([endereco[0], endereco[1]]).addTo(grupoMarcadores);            

            //Bruxaria para ler imagem
            const objetoFoto = dados.message[i].foto;
            const ListaBytes = new Uint8Array(objetoFoto.data);
            const blob = new Blob([ListaBytes], { type: 'image/png' });
            const imgURL = URL.createObjectURL(blob);

            //Informacoes no popUp da estacao
            const imagem = objetoFoto.data.length == 0 ? '' :
             `<img src="${imgURL}" alt="Imagem" style="width: 100px;" />`;

            const botaoDeletar = !ehAdmin ? '' : `
                <button onclick = "criadorBotaoDeletar(${dados.message[i].id})">
                    <img src="../assets/trash.png" alt="lixo" style="width: 16px;" />
                </button>
            `;

             const textoPopUp = 
            `<div>
                <p>${dados.message[i].nome}</p>
                ${imagem}
                ${botaoDeletar}
            </div>`;

            temp.on('mouseover', evento => {
                temp.bindPopup(textoPopUp).openPopup();
            });
        }
    }
    catch(erro){
        alert("Falha ao tentar comunicação com o servidor");
    }
}

receberMarcadores();

async function enviarFormulario() {
    const latitude = marcadorEstacao.getLatLng().lat;
    const longitude = marcadorEstacao.getLatLng().lng;

    const inputNome = document.getElementById("nome");
    const nome = inputNome.value;
    const inputFile = document.getElementById("foto");
    const inputDescricao = document.getElementById("descricao");
    const descricao = inputDescricao.value;

    console.log("descricao");
    console.log(descricao);
    
    console.log(inputFile.files.length);
    if(nome==""){
        alert("Preencha o nome");
        return;
    }

    if(marcadorEstacao._mapToAdd==null){
        alert("Clique no mapa para marcar o local da estacao");
        return;
    }

    //Me surpreende muito que isso nao causa erro
    const foto = inputFile.files[0];

    const posMarcador = `'POINT(${latitude} ${longitude})', 4326`;
    console.log(posMarcador);
    console.log("Arquivo", inputFile.files[0]);

    const formData = new FormData();
    formData.append('foto', foto);
    formData.append('nome', nome);
    formData.append('localizacao', posMarcador);
    formData.append('descricao', descricao);

    console.log("form");
    console.log(formData.getAll("descricao"));
 
    await fetch('http://localhost:3000/estacao', {
            method: 'POST',
            body: formData
        }
    )
    .then(response => {
        console.log(response);
        if(response.ok){
            alert("Estacao criada");
        }
        else{
            alert("Deu ruim");
        }
    });

    //Limpar os campos
    inputNome.value = '';
    inputFile.value = '';
    inputDescricao.value = '';
}

async function enviarERecriar(){
    await enviarFormulario();
    await receberMarcadores();
}

//Criar a parte do html de cadastrar uma nova estação
if(ehAdmin){

    const destino = document.getElementById("API-Leaflet");

    const containerCadastro = document.createElement("div")
    containerCadastro.className = "cadastro-container";

    const inputNome = document.createElement("input");
    inputNome.type = "text";
    inputNome.placeholder="nome";
    inputNome.id="nome";
    containerCadastro.appendChild(inputNome);

    const inputDescricao = document.createElement("input");
    inputDescricao.type = "text";
    inputDescricao.placeholder="descricao";
    inputDescricao.id="descricao";
    containerCadastro.appendChild(inputDescricao);

    const inputFoto = document.createElement("input");
    inputFoto.type = "file";
    inputFoto.placeholder="foto";
    inputFoto.id="foto";
    containerCadastro.appendChild(inputFoto);

    const botaoEstacao = document.createElement("button");
    botaoEstacao.textContent = "Criar Estação";
    botaoEstacao.id = "submit-estacao";
    botaoEstacao.addEventListener('click', enviarERecriar);
    containerCadastro.appendChild(botaoEstacao);

    destino.appendChild(containerCadastro);
}
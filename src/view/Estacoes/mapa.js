window.onload = function() {
    const token = localStorage.getItem("token");
    console.log("token:", token);

    // Se o token não estiver presente, redireciona para a página de bicicletas
    if (!token) {
        window.location.href = "./bicicletas.html"; // Redireciona para a página de login
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
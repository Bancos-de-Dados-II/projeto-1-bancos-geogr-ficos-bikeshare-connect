async function receberEstacoes() {
    try{
        const resposta = await fetch("http://localhost:3000/estacao", {
            method: "GET",
        });
        const dados = await resposta.json();

        for(let i=0; i<dados.message.length; i++){
            console.log(dados.message[i].descricao);

            //Bruxaria para ler imagem
            const objetoFoto = dados.message[i].foto;
            const ListaBytes = new Uint8Array(objetoFoto.data);
            const blob = new Blob([ListaBytes], { type: 'image/png' });
            const imgURL = URL.createObjectURL(blob);

            //Inserir card de estacao
            const card = document.createElement('div');
            card.className = "card";

            const foto = document.createElement('img');
            foto.src = imgURL;
            card.appendChild(foto);

            const conteudo = document.createElement('div');

            const titulo = document.createElement('h2');
            titulo.className = "card-title";
            titulo.textContent = dados.message[i].nome;
            conteudo.appendChild(titulo);

            const descricao = document.createElement("p");
            descricao.className = "card-description";
            descricao.textContent = dados.message[i].descricao;
            conteudo.appendChild(descricao);

            card.appendChild(conteudo);

            const destino = document.getElementById("listaEstacoes");
            destino.appendChild(card);
        }
    }
    catch(erro){
        alert("Falha ao tentar comunicação com o servidor");
    }
}

receberEstacoes();
async function loginUsuario(){
    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;

    // Log para depuração
    console.log("email", email);
    console.log("Senha:", senha);

    try {
        const response = await fetch("http://localhost:3000/login", {
            method: "POST", // Método POST
            headers: {
                "Content-Type": "application/json", // Envia o conteúdo como JSON
            },
            body: JSON.stringify({ email, senha }), // Envia email e senha no corpo da requisição
        });

        const result = await response.json(); // Converte a resposta para JSON


        if (response.ok) {
            // Exibe mensagem de sucesso
            console.log("Usuário logado:", result.user); // Log do usuário logado

            console.log("token", result.token);
            localStorage.setItem("token", result.token); // Salva o token no localStorage
            // Redireciona o usuário para pag de bicicletas
            window.location.href = "../Bicicletas/bicicletas.html";
        } else {
            // Exibe mensagem de erro vinda do servidor ou uma padrão
           console.log("Erro ao realizar login.");
        }
    } catch (error) {
        console.error("Erro ao se conectar ao servidor:", error);
       // document.getElementById("loginMessage").textContent = "Erro ao se conectar ao servidor.";
    }
};

    

document.getElementById('next-button').addEventListener('click', loginUsuario);

window.onload = function() {
    const token = localStorage.getItem("token");
    console.log("token:", token);
    const payload = JSON.parse(atob(token.split(".")[1])); // Decodifica o payload
        console.log(payload.tipo);
    // Se o token não estiver presente, redireciona para a página de login
    if (!token) {
        window.location.href = "../Login/index.html"; // Redireciona para a página de login
        return; // Interrompe a execução do código aqui
    }

    try {
        

        // Verifica o tipo de usuário
        if (payload.tipo === "Comum") {
            // Se for tipo Comum, redireciona para bicicletas.html
            window.location.href = "./bicicletas.html"; // Redireciona para a página de bicicletas
        } else {
            // Caso contrário, assume que é um administrador
            console.log("Bem-vindo, administrador!");
            // Você pode adicionar mais funcionalidades aqui para exibir elementos específicos de administrador
        }
    } catch (error) {
        console.error("Erro ao processar o token:", error);
        window.location.href = "./bicicletas.html"; // Em caso de erro no processamento, redireciona para a página de login
    }
};


window.ehADM = true;
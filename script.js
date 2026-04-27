document.getElementById('btn-salvar').addEventListener('click', function() {
    const nome = document.getElementById('nome-pagamento').value;

    if (nome === "") {
        alert("Por favor, digite um nome para a forma de pagamento.");
        return;
    }

    console.log("Forma de pagamento capturada:", nome);
    alert("Pronto para gravar: " + nome);
    
    // Limpa o campo após "salvar"
    document.getElementById('nome-pagamento').value = "";
});
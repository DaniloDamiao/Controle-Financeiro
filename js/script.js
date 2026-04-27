document.getElementById('btn-salvar').addEventListener('click', function() {
    const nomeForma = document.getElementById('nome-pagamento').value;
    const scriptURL = 'https://script.google.com/macros/s/AKfycbwh2i-qpbGkMTMwytyvToPxK0Z8PD1o9NdKY88UUkyo2mpvsdZMsAp4dSHGZIMUyPJ_2A/exec';

    if (nomeForma === "") {
        alert("Digite o nome da forma de pagamento!");
        return;
    }

    // Muda o texto do botão para mostrar que está salvando
    const btn = this;
    btn.innerText = "Gravando...";
    btn.disabled = true;

    fetch(scriptURL, {
    method: 'POST',
    mode: 'no-cors', // ESTA LINHA É A CHAVE
    cache: 'no-cache',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({ "nome": nomeForma })
})
.then(() => {
    // No modo no-cors, o Google não retorna uma resposta legível,
    // então assumimos que se não deu erro de rede, ele enviou.
    alert("Solicitação enviada! Verifique sua planilha em alguns segundos.");
    document.getElementById('nome-pagamento').value = "";
})
.catch(error => {
    console.error('Erro de rede:', error);
    alert("Erro na conexão.");
})
    .finally(() => {
        btn.innerText = "Salvar Forma";
        btn.disabled = false;
    });
});
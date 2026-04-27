document.getElementById('btn-salvar').addEventListener('click', function() {
    const nomeForma = document.getElementById('nome-pagamento').value;
    const scriptURL = 'https://script.google.com/macros/s/AKfycbwh2i-qpbGkMTMwytyvToPxK0Z8PD1o9NdKY88UUkyo2mpvsdZMsAp4dSHGZIMUyPJ_2A/exec';

    if (!nomeForma) {
        alert("Digite a forma de pagamento!");
        return;
    }

    fetch(scriptURL, {
        method: 'POST',
        body: JSON.stringify({ "nome": nomeForma })
    })
    .then(res => res.json())
    .then(data => {
        if (data.result === "success") {
            alert("Cadastro efetuado com sucesso!");
            document.getElementById('nome-pagamento').value = "";
        } else {
            alert(data.message); // Aqui ele vai avisar se já existe!
        }
    })
    .catch(err => console.error("Erro:", err));
});
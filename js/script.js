// 1. Defina a URL no topo, fora de tudo!
const scriptURL = 'https://script.google.com/macros/s/AKfycbwh2i-qpbGkMTMwytyvToPxK0Z8PD1o9NdKY88UUkyo2mpvsdZMsAp4dSHGZIMUyPJ_2A/exec'; 

// 2. Função para carregar a lista
function carregarFormasPagamento() {
    const listaUl = document.getElementById('lista-pagamentos');
    if (!listaUl) return; // Segurança caso o elemento não exista na tela

    listaUl.innerHTML = "<p style='padding:10px;'>Carregando formas...</p>";

    fetch(scriptURL) // Agora ele vai encontrar a variável definida lá no topo
        .then(res => res.json())
        .then(dados => {
            listaUl.innerHTML = "";
            dados.forEach(item => {
                const li = document.createElement('li');
                li.style = "background: white; margin-bottom: 8px; padding: 15px; border-radius: 10px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 5px rgba(0,0,0,0.05); border-left: 4px solid #2ecc71;";
                li.innerHTML = `
                    <span style="font-weight: bold; color: #2c3e50;">${item.nome}</span>
                    <span style="font-size: 10px; color: #bdc3c7;">ID: ${item.id}</span>
                `;
                listaUl.appendChild(li);
            });
        })
        .catch(err => {
            listaUl.innerHTML = "<p style='color:red;'>Erro ao carregar lista.</p>";
            console.error("Erro na leitura:", err);
        });
}

// 3. Chamar ao carregar a página
window.onload = carregarFormasPagamento;

// 4. Lógica do Botão Salvar (já simplificada usando a mesma URL do topo)
document.getElementById('btn-salvar').addEventListener('click', function() {
    const nomeForma = document.getElementById('nome-pagamento').value;
    
    if (!nomeForma) {
        alert("Digite a forma de pagamento!");
        return;
    }

    const btn = this;
    btn.disabled = true;
    btn.innerText = "Gravando...";

    fetch(scriptURL, {
        method: 'POST',
        body: JSON.stringify({ "nome": nomeForma })
    })
    .then(res => res.json())
    .then(data => {
        if (data.result === "success") {
            alert("Cadastro efetuado com sucesso!");
            document.getElementById('nome-pagamento').value = "";
            carregarFormasPagamento(); // Atualiza a lista na hora!
        } else {
            alert(data.message);
        }
    })
    .finally(() => {
        btn.disabled = false;
        btn.innerText = "Salvar Forma";
    });
});
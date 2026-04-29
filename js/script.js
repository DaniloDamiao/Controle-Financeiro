const scriptURL = 'https://script.google.com/macros/s/AKfycbwh2i-qpbGkMTMwytyvToPxK0Z8PD1o9NdKY88UUkyo2mpvsdZMsAp4dSHGZIMUyPJ_2A/exec';

// Carregar ao abrir
window.onload = carregarFormasPagamento;

function carregarFormasPagamento() {
    const listaUl = document.getElementById('lista-pagamentos');
    if (!listaUl) return;
    listaUl.innerHTML = "<p>Carregando...</p>";

    // ADICIONADO: tabName=FORMA PGMT para o Google saber onde buscar
    fetch(`${scriptURL}?tabName=FORMA PGMT`)
        .then(res => res.json())
        .then(dados => {
            listaUl.innerHTML = "";

            // SEGURANÇA: Verifica se recebemos uma lista ou um erro
            if (!Array.isArray(dados)) {
                console.error("Erro do Google:", dados);
                listaUl.innerHTML = "<p>Erro ao carregar dados da planilha.</p>";
                return;
            }

            if (dados.length === 0) {
                listaUl.innerHTML = "<p>Nenhuma forma cadastrada.</p>";
                return;
            }

            dados.forEach(item => {
                const li = document.createElement('li');
                li.style = "background: white; margin-bottom: 10px; padding: 15px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 5px rgba(0,0,0,0.05);";
                li.innerHTML = `
                    <div>
                        <span style="font-weight: bold; color: #2c3e50; display: block;">${item.nome}</span>
                        <small style="color: #95a5a6;">ID: ${item.id}</small>
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <button onclick="prepararEdicao(${item.id}, '${item.nome}')" style="background:none; border:none; color:#3498db; cursor:pointer;"><i class="material-icons">edit</i></button>
                        <button onclick="excluirForma(${item.id})" style="background:none; border:none; color:#e74c3c; cursor:pointer;"><i class="material-icons">delete_outline</i></button>
                    </div>
                `;
                listaUl.appendChild(li);
            });
        })
        .catch(err => {
            listaUl.innerHTML = "<p>Erro de conexão.</p>";
            console.error(err);
        });
}

function prepararEdicao(id, nome) {
    document.getElementById('id-pagamento').value = id;
    document.getElementById('nome-pagamento').value = nome;
    document.getElementById('label-input').innerText = "Alterar Forma de Pagamento";
    document.getElementById('btn-cancelar').style.display = "flex";
    document.getElementById('nome-pagamento').focus();
}

document.getElementById('btn-cancelar').onclick = function() {
    limparFormulario();
};

function limparFormulario() {
    document.getElementById('id-pagamento').value = "";
    document.getElementById('nome-pagamento').value = "";
    document.getElementById('label-input').innerText = "Nova Forma de Pagamento";
    document.getElementById('btn-cancelar').style.display = "none";
}

document.getElementById('btn-salvar').addEventListener('click', function() {
    const id = document.getElementById('id-pagamento').value;
    const nome = document.getElementById('nome-pagamento').value;

    if (!nome) return alert("Digite o nome!");

    const payload = {
        action: id ? "update" : "create",
        tabName: "FORMA PGMT", // ADICIONADO: tabName no POST também
        id: id,
        nome: nome
    };

    fetch(scriptURL, {
        method: 'POST',
        body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(data => {
        if (data.result === "success") {
            alert("Operação realizada com sucesso!");
            limparFormulario();
            carregarFormasPagamento();
        } else {
            alert("Erro: " + (data.message || "Verifique a planilha"));
        }
    });
});

function excluirForma(id) {
    if (confirm("Deseja realmente excluir esta forma?")) {
        // ADICIONADO: tabName na exclusão via GET
        fetch(`${scriptURL}?action=delete&id=${id}&tabName=FORMA PGMT`)
        .then(() => {
            alert("Excluído com sucesso!");
            carregarFormasPagamento();
        });
    }
}
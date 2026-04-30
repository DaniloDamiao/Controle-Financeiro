const scriptURL = 'https://script.google.com/macros/s/AKfycbwh2i-qpbGkMTMwytyvToPxK0Z8PD1o9NdKY88UUkyo2mpvsdZMsAp4dSHGZIMUyPJ_2A/exec';

const getVal = (id) => document.getElementById(id) ? document.getElementById(id).value : "";
const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ""; };

window.onload = function() {
    carregarListaPagamentos();
    
    // Adiciona o evento de clique ao botão cancelar assim que a página carrega
    const btnCancelar = document.getElementById('btn-cancelar');
    if (btnCancelar) {
        btnCancelar.addEventListener('click', cancelarEdicao);
    }
};

// --- FUNÇÃO DE LEITURA ---
function carregarListaPagamentos() {
    const listaUl = document.getElementById('lista-pagamentos');
    if (!listaUl) return;
    listaUl.innerHTML = "<p style='color: gray;'>Carregando métodos...</p>";

    fetch(`${scriptURL}?tabName=FORMA PGMT`)
        .then(res => res.json())
        .then(dados => {
            listaUl.innerHTML = "";
            if (!Array.isArray(dados) || dados.length === 0) {
                listaUl.innerHTML = "<p style='color: orange;'>Nenhum registro encontrado.</p>";
                return;
            }

            dados.forEach(item => {
                const li = document.createElement('li');
                li.style = "background: white; margin-bottom: 10px; padding: 15px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 5px rgba(0,0,0,0.05);";
                const dadosString = JSON.stringify(item).replace(/'/g, "&apos;");

                li.innerHTML = `
                    <span style="font-weight: bold; color: #2c3e50;">${item.nome}</span>
                    <div style="display: flex; gap: 10px;">
                        <button onclick='prepararEdicaoPagamento(${dadosString})' style="background:none; border:none; color:#3498db; cursor:pointer;"><i class="material-icons">edit</i></button>
                        <button onclick="excluirPagamento(${item.id})" style="background:none; border:none; color:#e74c3c; cursor:pointer;"><i class="material-icons">delete_outline</i></button>
                    </div>`;
                listaUl.appendChild(li);
            });
        });
}

// --- FUNÇÃO DE GRAVAÇÃO ---
const btnSalvar = document.getElementById('btn-salvar-pagamento');
if (btnSalvar) {
    btnSalvar.addEventListener('click', function() {
        const idVal = getVal('id-pagamento');
        const nomeVal = getVal('nome-pagamento');

        if (!nomeVal) { alert("Digite o nome!"); return; }

        const payload = {
            action: idVal ? "update" : "create",
            tabName: "FORMA PGMT",
            id: idVal,
            nome: nomeVal.toUpperCase()
        };

        btnSalvar.innerText = "Gravando...";
        btnSalvar.disabled = true;

        fetch(scriptURL, { method: 'POST', body: JSON.stringify(payload) })
        .then(res => res.json())
        .then(data => {
            if (data.result === "success") {
                alert("Gravado com sucesso!");
                location.reload();
            } else {
                alert("Erro: " + data.message);
                resetBtn();
            }
        }).catch(() => { alert("Erro de conexão."); resetBtn(); });
    });
}

// --- FUNÇÃO DE CANCELAR (RESETA O FORMULÁRIO) ---
function cancelarEdicao() {
    setVal('id-pagamento', "");
    setVal('nome-pagamento', "");
    
    // Esconde o botão cancelar
    const btnCancelar = document.getElementById('btn-cancelar');
    if (btnCancelar) btnCancelar.style.display = "none";
    
    // Volta o título para o original
    const label = document.getElementById('label-input');
    if (label) label.innerText = "Nova Forma de Pagamento";
    
    // Reseta o botão de salvar
    resetBtn();
}

function resetBtn() {
    if (btnSalvar) {
        btnSalvar.innerText = "Salvar Forma PGTO";
        btnSalvar.disabled = false;
    }
}

function prepararEdicaoPagamento(item) {
    setVal('id-pagamento', item.id);
    setVal('nome-pagamento', item.nome);
    if (document.getElementById('btn-cancelar')) document.getElementById('btn-cancelar').style.display = "flex";
    if (document.getElementById('label-input')) document.getElementById('label-input').innerText = "ALTERAR PAGAMENTO";
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function excluirPagamento(id) {
    if (confirm("Deseja realmente excluir esta forma de pagamento?")) {
        fetch(`${scriptURL}?action=delete&id=${id}&tabName=FORMA PGMT`).then(() => location.reload());
    }
}
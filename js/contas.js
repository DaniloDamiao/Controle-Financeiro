const scriptURL = 'https://script.google.com/macros/s/AKfycbwh2i-qpbGkMTMwytyvToPxK0Z8PD1o9NdKY88UUkyo2mpvsdZMsAp4dSHGZIMUyPJ_2A/exec';

// Dispara as duas funções quando a página carregar
window.onload = function() {
    carregarCategoriasParaSelect();
    carregarListaDeContas();
};

// 1. CARREGA AS OPÇÕES DO SUBMENU NO SELECT
function carregarCategoriasParaSelect() {
    const select = document.getElementById('select-submenu');
    if (!select) return;

    fetch(`${scriptURL}?tabName=SUBMENU`)
        .then(res => res.json())
        .then(dados => {
            // Mantém a opção padrão "Selecione..."
            select.innerHTML = '<option value="">Selecione...</option>';
            dados.forEach(item => {
                let opt = document.createElement('option');
                opt.value = item.nome;
                opt.innerHTML = item.nome;
                select.appendChild(opt);
            });
        })
        .catch(err => console.error("Erro ao carregar categorias:", err));
}

// 2. CARREGA A LISTA DE CONTAS CADASTRADAS ABAIXO DO FORMULÁRIO
function carregarListaDeContas() {
    const listaUl = document.getElementById('lista-contas');
    if (!listaUl) return;
    listaUl.innerHTML = "<p>Carregando contas...</p>";

    fetch(`${scriptURL}?tabName=CONTAS`)
        .then(res => res.json())
        .then(dados => {
            listaUl.innerHTML = "";
            if (dados.length === 0) {
                listaUl.innerHTML = "<p style='text-align:center; color:#95a5a6;'>Nenhuma conta cadastrada.</p>";
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
                        <button onclick="prepararEdicaoContas(${item.id}, '${item.nome}')" style="background:none; border:none; color:#3498db; cursor:pointer;"><i class="material-icons">edit</i></button>
                        <button onclick="excluirConta(${item.id})" style="background:none; border:none; color:#e74c3c; cursor:pointer;"><i class="material-icons">delete_outline</i></button>
                    </div>
                `;
                listaUl.appendChild(li);
            });
        })
        .catch(err => {
            listaUl.innerHTML = "<p>Erro ao carregar lista.</p>";
            console.error("Erro ao carregar contas:", err);
        });
}

// 3. EVENTO DO BOTÃO SALVAR
// Usamos uma verificação para garantir que o botão existe
const btnSalvar = document.getElementById('btn-salvar-conta');
if (btnSalvar) {
    btnSalvar.addEventListener('click', function() {
        const tipo = document.querySelector('input[name="tipo-conta"]:checked');
        const nomeInput = document.getElementById('nome-conta');
        
        const payload = {
            action: document.getElementById('id-conta').value ? "update" : "create",
            tabName: "CONTAS",
            id: document.getElementById('id-conta').value,
            nome: nomeInput.value.toUpperCase(),
            tipo: tipo ? tipo.value : "",
            submenu: document.getElementById('select-submenu').value,
            obs1: document.getElementById('obs1').value.toUpperCase(),
            obs2: document.getElementById('obs2').value.toUpperCase()
        };

        if (!payload.nome || !payload.tipo) {
            alert("Preencha a descrição e o tipo (Receita/Despesa)!");
            return;
        }

        fetch(scriptURL, { method: 'POST', body: JSON.stringify(payload) })
        .then(res => res.json())
        .then(data => {
            if(data.result === "success") {
                alert("Cadastro efetuado!");
                location.reload(); 
            }
        });
    });
}

// FUNÇÕES AUXILIARES PARA EDIÇÃO E EXCLUSÃO
function prepararEdicaoContas(id, nome) {
    document.getElementById('id-conta').value = id;
    document.getElementById('nome-conta').value = nome;
    document.getElementById('btn-cancelar').style.display = "block";
    document.getElementById('label-input').innerText = "ALTERAR CONTA";
    window.scrollTo(0,0);
}

function excluirConta(id) {
    if (confirm("Deseja excluir esta conta?")) {
        fetch(`${scriptURL}?action=delete&id=${id}&tabName=CONTAS`)
        .then(() => {
            alert("Conta excluída!");
            carregarListaDeContas();
        });
    }
}
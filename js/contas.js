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
            select.innerHTML = '<option value="">Selecione...</option>';
            // Proteção contra erro de dados não-array
            if (!Array.isArray(dados)) return;

            dados.forEach(item => {
                let opt = document.createElement('option');
                opt.value = item.nome;
                opt.innerHTML = item.nome;
                select.appendChild(opt);
            });
        })
        .catch(err => console.error("Erro ao carregar categorias:", err));
}

// 2. CARREGA A LISTA DE CONTAS COM TODOS OS DADOS
function carregarListaDeContas() {
    const listaUl = document.getElementById('lista-contas');
    if (!listaUl) return;
    listaUl.innerHTML = "<p>Carregando contas...</p>";

    fetch(`${scriptURL}?tabName=CONTAS`)
        .then(res => res.json())
        .then(dados => {
            listaUl.innerHTML = "";
            
            // Proteção para garantir que o sistema não trave se o Google retornar erro
            if (!Array.isArray(dados)) {
                console.error("Dados recebidos não são uma lista:", dados);
                listaUl.innerHTML = "<p style='color:red;'>Erro ao ler dados da planilha.</p>";
                return;
            }

            if (dados.length === 0) {
                listaUl.innerHTML = "<p style='text-align:center; color:#95a5a6;'>Nenhuma conta cadastrada.</p>";
                return;
            }

            dados.forEach(item => {
                const li = document.createElement('li');
                li.style = "background: white; margin-bottom: 10px; padding: 15px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 5px rgba(0,0,0,0.05);";
                
                // Convertemos o objeto em string segura para o botão editar
                const dadosString = JSON.stringify(item).replace(/'/g, "\\'");

                li.innerHTML = `
                    <div>
                        <span style="font-weight: bold; color: #2c3e50; display: block;">${item.nome}</span>
                        <small style="color: #95a5a6;">${item.tipo || 'S/T'} | ${item.submenu || 'S/C'}</small>
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <button onclick='prepararEdicaoContas(${dadosString})' style="background:none; border:none; color:#3498db; cursor:pointer;"><i class="material-icons">edit</i></button>
                        <button onclick="excluirConta(${item.id})" style="background:none; border:none; color:#e74c3c; cursor:pointer;"><i class="material-icons">delete_outline</i></button>
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

// 3. EVENTO DO BOTÃO SALVAR
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
            } else {
                alert("Erro: " + data.message);
            }
        });
    });
}

// 4. FUNÇÃO DE EDIÇÃO - CARREGA TODOS OS CAMPOS
function prepararEdicaoContas(item) {
    document.getElementById('id-conta').value = item.id;
    document.getElementById('nome-conta').value = item.nome;
    
    // Marca o Radio Button
    const radio = document.querySelector(`input[name="tipo-conta"][value="${item.tipo}"]`);
    if (radio) radio.checked = true;

    // Seleciona o Submenu
    document.getElementById('select-submenu').value = item.submenu || "";

    // Preenche Observações
    document.getElementById('obs1').value = item.obs1 || "";
    document.getElementById('obs2').value = item.obs2 || "";

    // Ajustes Visuais
    document.getElementById('btn-cancelar').style.display = "flex";
    document.getElementById('label-input').innerText = "ALTERAR CONTA";
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 5. BOTÃO CANCELAR
const btnCancelar = document.getElementById('btn-cancelar');
if (btnCancelar) {
    btnCancelar.onclick = function() {
        limparFormulario();
    };
}

function limparFormulario() {
    document.getElementById('id-conta').value = "";
    document.getElementById('nome-conta').value = "";
    document.getElementById('obs1').value = "";
    document.getElementById('obs2').value = "";
    document.getElementById('select-submenu').value = "";
    
    // Desmarca os radios
    const radios = document.querySelectorAll('input[name="tipo-conta"]');
    radios.forEach(r => r.checked = false);

    document.getElementById('btn-cancelar').style.display = "none";
    document.getElementById('label-input').innerText = "Nova Conta";
    document.getElementById('nome-conta').focus();
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
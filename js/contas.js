const scriptURL = 'https://script.google.com/macros/s/AKfycbwh2i-qpbGkMTMwytyvToPxK0Z8PD1o9NdKY88UUkyo2mpvsdZMsAp4dSHGZIMUyPJ_2A/exec';

const getVal = (id) => {
    const el = document.getElementById(id);
    return el ? el.value : "";
};

const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.value = val || "";
};

window.onload = function() {
    carregarCategoriasParaSelect();
    carregarListaDeContas();

    // ESCUTA O CLIQUE DO BOTÃO CANCELAR
    const btnCanc = document.getElementById('btn-cancelar');
    if (btnCanc) {
        btnCanc.addEventListener('click', cancelarEdicaoContas);
    }
};

// 1. CARREGA AS OPÇÕES DO SUBMENU
function carregarCategoriasParaSelect() {
    const select = document.getElementById('select-submenu');
    if (!select) return;

    fetch(`${scriptURL}?tabName=SUBMENU`)
        .then(res => res.json())
        .then(dados => {
            select.innerHTML = '<option value="">Selecione...</option>';
            if (Array.isArray(dados)) {
                dados.forEach(item => {
                    let opt = document.createElement('option');
                    opt.value = item.nome;
                    opt.innerHTML = item.nome;
                    select.appendChild(opt);
                });
            }
        }).catch(err => console.error("Erro Submenu:", err));
}

// 2. CARREGA A LISTA DE CONTAS
function carregarListaDeContas() {
    const listaUl = document.getElementById('lista-contas');
    if (!listaUl) return;
    listaUl.innerHTML = "<p>Carregando...</p>";

    fetch(`${scriptURL}?tabName=CONTAS`)
        .then(res => res.json())
        .then(dados => {
            listaUl.innerHTML = "";
            if (!Array.isArray(dados)) return;
            dados.forEach(item => {
                const li = document.createElement('li');
                li.style = "background: white; margin-bottom: 10px; padding: 15px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 5px rgba(0,0,0,0.05);";
                
                const dadosString = JSON.stringify(item).replace(/'/g, "&apos;");

                li.innerHTML = `
                    <div>
                        <span style="font-weight: bold; color: #2c3e50; display: block;">${item.nome}</span>
                        <small style="color: #95a5a6;">${item.tipo} | ${item.submenu}</small>
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <button onclick='prepararEdicaoContas(${dadosString})' style="background:none; border:none; color:#3498db; cursor:pointer;"><i class="material-icons">edit</i></button>
                        <button onclick="excluirConta(${item.id})" style="background:none; border:none; color:#e74c3c; cursor:pointer;"><i class="material-icons">delete_outline</i></button>
                    </div>`;
                listaUl.appendChild(li);
            });
        }).catch(err => console.error("Erro Lista:", err));
}

// 3. FUNÇÃO PARA PREPARAR A EDIÇÃO
function prepararEdicaoContas(item) {
    setVal('id-conta', item.id);
    setVal('nome-conta', item.nome);
    setVal('select-submenu', item.submenu);
    setVal('obs1', item.obs1);
    setVal('obs2', item.obs2);

    const radio = document.querySelector(`input[name="tipo-conta"][value="${item.tipo}"]`);
    if (radio) radio.checked = true;

    if (document.getElementById('btn-cancelar')) document.getElementById('btn-cancelar').style.display = "flex";
    if (document.getElementById('label-input')) document.getElementById('label-input').innerText = "ALTERAR CONTA";

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 4. FUNÇÃO CANCELAR (RESETA TUDO)
function cancelarEdicaoContas() {
    // Limpa campos de texto e hidden
    setVal('id-conta', "");
    setVal('nome-conta', "");
    setVal('select-submenu', "");
    setVal('obs1', "");
    setVal('obs2', "");

    // Desmarca os Radio Buttons
    const radios = document.querySelectorAll('input[name="tipo-conta"]');
    radios.forEach(r => r.checked = false);

    // Reseta visual
    if (document.getElementById('btn-cancelar')) document.getElementById('btn-cancelar').style.display = "none";
    if (document.getElementById('label-input')) document.getElementById('label-input').innerText = "Nova Conta";
    
    const btnSalvar = document.getElementById('btn-salvar-conta');
    if (btnSalvar) {
        btnSalvar.innerText = "Salvar Conta";
        btnSalvar.disabled = false;
    }
}

// 5. LÓGICA DO BOTÃO SALVAR
const btnSalvar = document.getElementById('btn-salvar-conta');
if (btnSalvar) {
    btnSalvar.addEventListener('click', function() {
        const idVal = getVal('id-conta');
        const tipoRadio = document.querySelector('input[name="tipo-conta"]:checked');
        
        const payload = {
            action: idVal ? "update" : "create",
            tabName: "CONTAS",
            id: idVal,
            nome: getVal('nome-conta').toUpperCase(),
            tipo: tipoRadio ? tipoRadio.value : "",
            submenu: getVal('select-submenu'),
            obs1: getVal('obs1').toUpperCase(),
            obs2: getVal('obs2').toUpperCase()
        };

        if (!payload.nome || !payload.tipo) {
            alert("Por favor, preencha o nome e selecione o tipo da conta.");
            return;
        }

        btnSalvar.innerText = "Gravando...";
        btnSalvar.disabled = true;

        fetch(scriptURL, { 
            method: 'POST', 
            body: JSON.stringify(payload) 
        })
        .then(res => res.json())
        .then(data => {
            if (data.result === "success") {
                alert("Dados gravados com sucesso!");
                location.reload();
            } else {
                alert("Erro ao gravar: " + data.message);
                btnSalvar.innerText = "Salvar Conta";
                btnSalvar.disabled = false;
            }
        }).catch(err => {
            alert("Erro na comunicação.");
            btnSalvar.innerText = "Salvar Conta";
            btnSalvar.disabled = false;
        });
    });
}

// 6. FUNÇÃO PARA EXCLUIR
function excluirConta(id) {
    if (confirm("Tem certeza que deseja excluir esta conta?")) {
        fetch(`${scriptURL}?action=delete&id=${id}&tabName=CONTAS`)
            .then(() => location.reload())
            .catch(err => alert("Erro ao excluir."));
    }
}
const scriptURL = 'https://script.google.com/macros/s/AKfycbwh2i-qpbGkMTMwytyvToPxK0Z8PD1o9NdKY88UUkyo2mpvsdZMsAp4dSHGZIMUyPJ_2A/exec';

window.onload = carregarCategorias;

function carregarCategorias() {
    const listaUl = document.getElementById('lista-categorias');
    if(!listaUl) return;
    listaUl.innerHTML = "<p>Carregando...</p>";

    fetch(`${scriptURL}?tabName=SUBMENU`)
        .then(res => res.json())
        .then(dados => {
            listaUl.innerHTML = "";
            if (!Array.isArray(dados)) return;
            
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
                        <button onclick="excluirCategoria(${item.id})" style="background:none; border:none; color:#e74c3c; cursor:pointer;"><i class="material-icons">delete_outline</i></button>
                    </div>
                `;
                listaUl.appendChild(li);
            });
        });
}

// --- NOVO: EVENTO PARA O BOTÃO CANCELAR ---
const btnCancelar = document.getElementById('btn-cancelar');
if (btnCancelar) {
    btnCancelar.onclick = function() {
        limparFormulario();
    };
}

document.getElementById('btn-salvar-categoria').addEventListener('click', function() {
    const id = document.getElementById('id-categoria').value;
    const nome = document.getElementById('nome-categoria').value;

    if (!nome) return alert("Digite o nome da categoria!");

    const payload = {
        action: id ? "update" : "create",
        tabName: "SUBMENU",
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
            alert("Categoria salva com sucesso!");
            limparFormulario();
            carregarCategorias();
        } else {
            alert(data.message);
        }
    });
});

function excluirCategoria(id) {
    if (confirm("Deseja excluir esta categoria?")) {
        fetch(`${scriptURL}?action=delete&id=${id}&tabName=SUBMENU`)
        .then(() => {
            alert("Excluída!");
            carregarCategorias();
        });
    }
}

function limparFormulario() {
    document.getElementById('id-categoria').value = "";
    document.getElementById('nome-categoria').value = "";
    document.getElementById('btn-cancelar').style.display = "flex";
    
    // Ajuste de UI para ficar intuitivo
    const label = document.getElementById('label-input');
    if (label) label.innerText = "Nova Categoria";
    
    document.getElementById('nome-categoria').focus();
}


function prepararEdicao(id, nome) {
    document.getElementById('id-categoria').value = id;
    document.getElementById('nome-categoria').value = nome;
    document.getElementById('btn-cancelar').style.display = "flex";
    
    const label = document.getElementById('label-input');
    if (label) label.innerText = "Alterar Categoria";
    
    document.getElementById('nome-categoria').focus();
    // Rola para o topo suavemente para o usuário ver que o campo mudou
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
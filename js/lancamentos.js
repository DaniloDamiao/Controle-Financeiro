const scriptURL = 'https://script.google.com/macros/s/AKfycbwh2i-qpbGkMTMwytyvToPxK0Z8PD1o9NdKY88UUkyo2mpvsdZMsAp4dSHGZIMUyPJ_2A/exec';

// Funções auxiliares para manipulação de campos
const getVal = (id) => document.getElementById(id) ? document.getElementById(id).value : "";
const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ""; };

window.onload = function () {
    // 1. Data padrão de hoje
    const hoje = new Date().toISOString().split('T')[0];
    setVal('data-emissao', hoje);
    setVal('data-vencimento', hoje);

    // 2. Carregar dados da planilha para os Selects
    carregarSelects();

    // 3. Aplicar lógica inicial de exibição dos switches
    toggleTipoSwitch();
    toggleMensalSwitch();
};

// --- CONTROLE DE EXIBIÇÃO DINÂMICA (ESTILO APP) ---

function toggleTipoSwitch() {
    const isVista = document.getElementById('switch-tipo').checked;
    const secaoParcelas = document.getElementById('secao-parcelas');
    const labelTexto = document.getElementById('label-tipo-texto');
    const labelData = document.getElementById('label-data');

    if (isVista) {
        labelTexto.innerText = "À VISTA";
        labelTexto.style.color = "#27ae60";
        secaoParcelas.style.display = "none";
        if (labelData) labelData.innerText = "DATA DO PGMT";
    } else {
        labelTexto.innerText = "À PRAZO";
        labelTexto.style.color = "#e74c3c";
        secaoParcelas.style.display = "block";
        if (labelData) labelData.innerText = "DATA 1º PARCELA";
    }
}

function toggleMensalSwitch() {
    const isMensal = document.getElementById('check-mensal').checked;
    const divPrazo = document.getElementById('div-prazo-dias');
    const containerVezes = document.getElementById('container-vezes');

    if (isMensal) {
        if (divPrazo) divPrazo.style.display = "none";
        if (containerVezes) containerVezes.style.display = "flex";
    } else {
        if (divPrazo) divPrazo.style.display = "flex";
        if (containerVezes) containerVezes.style.display = "flex"; 
    }
}

// --- CARREGAMENTO DE DADOS DA PLANILHA ---

function carregarSelects() {
    const abas = [
        { tab: "SUBMENU", id: "select-categoria" },
        { tab: "CONTAS", id: "select-conta" },
        { tab: "FORMA PGMT", id: "select-pagamento" }
    ];

    abas.forEach(item => {
        fetch(`${scriptURL}?tabName=${encodeURIComponent(item.tab)}`)
            .then(res => res.json())
            .then(dados => preencherSelect(item.id, dados))
            .catch(err => console.error("Erro ao carregar " + item.tab, err));
    });
}

function preencherSelect(id, dados) {
    const select = document.getElementById(id);
    if (!select || !Array.isArray(dados)) return;

    select.innerHTML = '<option value="">Selecione...</option>';
    dados.forEach(item => {
        const opt = document.createElement('option');
        opt.value = item.nome;
        opt.innerText = item.nome;
        select.appendChild(opt);
    });
}

// --- LÓGICA DE GRAVAÇÃO (SAVE) ---

function realizarLancamento() {
    const btn = document.getElementById('btn-salvar-lancamento');
    const isVista = document.getElementById('switch-tipo').checked;
    const isMensal = document.getElementById('check-mensal').checked;
    const qtdVezes = parseInt(getVal('input-vezes')) || 1;

    if (btn) btn.disabled = true;

    const payload = {
        tabName: "LANÇAMENTO",
        emissao: getVal('data-emissao'),
        formaPgmt: getVal('select-pagamento'),
        categoria: getVal('select-categoria'),
        conta: getVal('select-conta'),
        descricao: getVal('descricao-lancamento').toUpperCase().trim(),
        vencimento: getVal('data-vencimento'),
        valorPrevisto: parseFloat(getVal('valor-total')) || 0,
        parcelas: isVista ? 1 : qtdVezes,
        repeticaoMensal: isMensal, // NOVO: Informa se deve somar meses ou dias
        prazoDias: getVal('prazo-dias'), // NOVO: Pega o intervalo de dias
        dataPagamento: isVista ? getVal('data-vencimento') : "",
        valorRealizado: isVista ? (parseFloat(getVal('valor-total')) || 0) : "",
        situacao: isVista ? "PAGO" : "À VENCER"
    };

    // Validação de segurança
    if (!payload.conta || !payload.valorPrevisto) {
        alert("Preencha a Conta e o Valor.");
        if (btn) btn.disabled = false;
        return;
    }

    fetch(scriptURL, {
        method: 'POST',
        body: JSON.stringify(payload)
    })
        .then(res => res.json())
        .then(res => {
            if (res.result === "success") {
                alert("Lançamento concluído!");
                location.reload();
            }
        })
        .catch(err => alert("Erro ao salvar."))
        .finally(() => { if (btn) btn.disabled = false; });
}

// --- LIMPAR FORMULÁRIO ---
function limparFormulario() {
    if (confirm("Deseja realmente limpar todos os campos?")) {
        location.reload();
    }
}
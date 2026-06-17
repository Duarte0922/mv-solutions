// Configuração do Firebase extraída do teu painel
const firebaseConfig = {
  apiKey: "AIzaSyC25Y91NEOS5iNMnVg0KpjyGu0BKA3dCg",
  authDomain: "mv-solutions-c4dfe.firebaseapp.com",
  projectId: "mv-solutions-c4dfe",
  storageBucket: "mv-solutions-c4dfe.firebasestorage.app",
  messagingSenderId: "675839508170",
  appId: "1:675839508170:web:bd892e75c01cff2ca27e33"
};

// Inicializa o Firebase no modo compatibilidade
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

// Ativa o cache offline seguro
db.enablePersistence().catch((err) => {
    console.log("Persistência offline não ativada:", err.code);
});

const itensBody = document.getElementById("itens");
const totalGeral = document.getElementById("totalGeral");
let idPedidoEmEdicao = null; 

document.addEventListener("DOMContentLoaded", () => {
    limparFormulario();
    carregarHistorico();
});

document.getElementById("btnAdicionar").addEventListener("click", () => adicionarItem());
document.getElementById("btnLimpar").addEventListener("click", limparFormulario);

// FUNÇÃO PARA ADICIONAR ITEM NA GRADE
function adicionarItem(qtd = 1, descricao = "", unitario = 0) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
        <td><input type="number" class="item-input qtd" value="${qtd}" min="1"></td>
        <td><input type="text" class="item-input descricao" placeholder="Descrição do serviço" value="${descricao}"></td>
        <td><input type="number" class="item-input unitario" value="${unitario}" step="0.01"></td>
        <td class="valorTotal">R$ 0,00</td>
        <td><button class="btn-remover">X</button></td>
    `;
    itensBody.appendChild(tr);

    tr.querySelector(".qtd").addEventListener("input", calcularTudo);
    tr.querySelector(".unitario").addEventListener("input", calcularTudo);
    tr.querySelector(".btn-remover").addEventListener("click", () => {
        tr.remove();
        calcularTudo();
    });
    calcularTudo();
}

// CALCULA TUDO NA TELA
function calcularTudo() {
    let total = 0;
    document.querySelectorAll("#itens tr").forEach(tr => {
        const qtd = parseFloat(tr.querySelector(".qtd").value) || 0;
        const unitario = parseFloat(tr.querySelector(".unitario").value) || 0;
        const subtotal = qtd * unitario;
        tr.querySelector(".valorTotal").innerText = subtotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
        total += subtotal;
    });
    totalGeral.innerText = total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// BUSCA OS ITENS DO FORMULÁRIO COMO UM ARRAY CORRETO
function obterItensDoFormulario() {
    const listaItens = [];
    document.querySelectorAll("#itens tr").forEach(tr => {
        const qtd = parseFloat(tr.querySelector(".qtd").value) || 1;
        const desc = tr.querySelector(".descricao").value;
        const unit = parseFloat(tr.querySelector(".unitario").value) || 0;
        const tot = tr.querySelector(".valorTotal").innerText;
        if (desc) {
            listaItens.push({ qtd: qtd, descricao: desc, unitario: unit, totalItem: tot });
        }
    });
    return listaItens;
}

// LIMPA OS CAMPOS DA TELA
function limparFormulario() {
    idPedidoEmEdicao = null;
    document.getElementById("cliente").value = "";
    document.getElementById("telefone").value = "";
    document.getElementById("endereco").value = "";
    document.getElementById("cidade").value = "Belo Horizonte";
    document.getElementById("data").value = new Date().toISOString().split('T')[0];
    document.getElementById("tipo").value = "Orçamento";
    document.getElementById("entrada").value = "";
    document.getElementById("pagamento").value = "";
    document.getElementById("observacoes").value = "";
    itensBody.innerHTML = "";
    
    if(document.getElementById("atualizarPedido")) {
        document.getElementById("atualizarPedido").style.display = "none";
    }
    document.getElementById("salvarPedido").innerText = "Salvar Novo Pedido";
    
    adicionarItem();
}

// SALVAR NOVO PEDIDO
document.getElementById("salvarPedido").addEventListener("click", async () => {
    const cliente = document.getElementById("cliente").value;
    if (!cliente) { alert("Informe o cliente."); return; }

    const numeroPedido = Math.floor(Date.now() / 1000).toString().slice(-5);
    const pedido = {
        numero: numeroPedido,
        cliente: cliente,
        telefone: document.getElementById("telefone").value,
        endereco: document.getElementById("endereco").value,
        cidade: document.getElementById("cidade").value,
        data: document.getElementById("data").value,
        tipo: document.getElementById("tipo").value,
        entrada: document.getElementById("entrada").value,
        formaPagamento: document.getElementById("pagamento").value,
        observacoes: document.getElementById("observacoes").value,
        total: totalGeral.innerText,
        itens: obterItensDoFormulario(),
        criadoEm: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
        await db.collection("pedidos").add(pedido);
        alert("Pedido salvo com sucesso!");
        limparFormulario();
        carregarHistorico();
    } catch (error) {
        alert("Erro ao salvar o pedido.");
    }
});

// SALVAR ALTERAÇÕES EM PEDIDO EXISTENTE
if(document.getElementById("atualizarPedido")) {
    document.getElementById("atualizarPedido").addEventListener("click", async () => {
        if (!idPedidoEmEdicao) return;
        const cliente = document.getElementById("cliente").value;
        if (!cliente) { alert("Informe o cliente."); return; }

        try {
            await db.collection("pedidos").doc(idPedidoEmEdicao).update({
                cliente: cliente,
                telefone: document.getElementById("telefone").value,
                endereco: document.getElementById("endereco").value,
                cidade: document.getElementById("cidade").value,
                data: document.getElementById("data").value,
                tipo: document.getElementById("tipo").value,
                entrada: document.getElementById("entrada").value,
                formaPagamento: document.getElementById("pagamento").value,
                observacoes: document.getElementById("observacoes").value,
                total: totalGeral.innerText,
                itens: obterItensDoFormulario()
            });
            alert("Pedido atualizado com sucesso!");
            limparFormulario();
            carregarHistorico();
        } catch (error) {
            alert("Erro ao atualizar o pedido.");
        }
    });
}

// PUXAR DADOS DO HISTÓRICO PARA A TELA AO CLICAR (Com trava anti-erro integrada)
async function carregarPedidoParaEdicao(idDocumento) {
    try {
        const doc = await db.collection("pedidos").doc(idDocumento).get();
        if (!doc.exists) { alert("Pedido não encontrado."); return; }
        
        const pedido = doc.data();
        idPedidoEmEdicao = idDocumento;

        document.getElementById("cliente").value = pedido.cliente || "";
        document.getElementById("telefone").value = pedido.telefone || "";
        document.getElementById("endereco").value = pedido.endereco || "";
        document.getElementById("cidade").value = pedido.cidade || "Belo Horizonte";
        document.getElementById("data").value = pedido.data || "";
        document.getElementById("tipo").value = pedido.tipo || "Orçamento";
        document.getElementById("entrada").value = pedido.entrada || "";
        document.getElementById("pagamento").value = pedido.formaPagamento || pedido.pagamento || "";
        document.getElementById("observacoes").value = pedido.observacoes || "";

        itensBody.innerHTML = "";
        // Validação: Garante que só roda o loop se itens for de facto uma lista válida
        if (pedido.itens && Array.isArray(pedido.itens) && pedido.itens.length > 0) {
            pedido.itens.forEach(item => {
                adicionarItem(item.qtd, item.descricao, item.unitario);
            });
        } else {
            // Se o item for um texto ou estiver vazio, adiciona uma linha limpa para preencheres
            adicionarItem();
        }

        if(document.getElementById("atualizarPedido")) {
            document.getElementById("atualizarPedido").style.display = "inline-block";
        }
        document.getElementById("salvarPedido").innerText = "Salvar como Novo (Clonar)";
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
        console.error(error);
        alert("Erro ao carregar os dados para o ecrã.");
    }
}

// BUSCAR HISTÓRICO ATUALIZADO
function carregarHistorico() {
    const historico = document.getElementById("historico");
    if (!historico) return;
    historico.innerHTML = "";
    
    db.collection("pedidos").orderBy("criadoEm", "desc").get().then((snapshot) => {
        snapshot.forEach((doc) => {
            const pedido = doc.data();
            const tr = document.createElement("tr");
            tr.style.cursor = "pointer";
            
            tr.innerHTML = `
                <td class="col-clicavel">${pedido.numero || '---'}</td>
                <td class="col-clicavel"><strong>${pedido.cliente}</strong></td>
                <td class="col-clicavel">${pedido.data}</td>
                <td class="col-clicavel">${pedido.total}</td>
                <td>
                    <button class="btn-pdf" data-id="${doc.id}" style="background:#007bff;color:white;border:none;padding:4px 8px;border-radius:4px;cursor:pointer;margin-right:5px;">Ver PDF</button>
                    <button class="btn-excluir" data-id="${doc.id}" style="background:#ff4d4d;color:white;border:none;padding:4px 8px;border-radius:4px;cursor:pointer;">Excluir</button>
                </td>
            `;

            tr.querySelectorAll(".col-clicavel").forEach(td => {
                td.addEventListener("click", () => carregarPedidoParaEdicao(doc.id));
            });

            tr.querySelector(".btn-pdf").addEventListener("click", (e) => {
                e.stopPropagation();
                if(typeof visualizarPedidoPdf === "function") {
                    visualizarPedidoPdf(doc.id);
                }
            });
            tr.querySelector(".btn-excluir").addEventListener("click", (e) => {
                e.stopPropagation();
                excluirPedido(doc.id);
            });

            historico.appendChild(tr);
        });
    }).catch(err => {
        console.log("Erro ao carregar histórico:", err);
    });
}

// EXCLUIR REGISTRO
async function excluirPedido(idDocumento) {
    if (confirm("Deseja excluir este pedido definitivamente?")) {
        await db.collection("pedidos").doc(idDocumento).delete();
        alert("Pedido excluído.");
        limparFormulario();
        carregarHistorico();
    }
}

// Configuração do Firebase extraída do seu painel
const firebaseConfig = {
  apiKey: "AIzaSyC25Y91NEOS5iNMnVg0KpjyGu0BKA3dCg",
  authDomain: "mv-solutions-c4dfe.firebaseapp.com",
  projectId: "mv-solutions-c4dfe",
  storageBucket: "mv-solutions-c4dfe.firebasestorage.app",
  messagingSenderId: "675839508170",
  appId: "1:675839508170:web:bd892e75c01cff2ca27e33"
};

// Inicializa o Firebase
firebase.initializeApp(firebaseConfig);

// Inicializa o Banco de Dados Cloud Firestore
const db = firebase.firestore();

// ATIVAR MODO OFFLINE AUTOMÁTICO (Mantém os dados gravados no dispositivo se cair a internet)
db.enablePersistence().catch((err) => {
    if (err.code == 'failed-precondition') {
        console.log('Persistência falhou: multiplas abas abertas.');
    } else if (err.code == 'unimplemented') {
        console.log('O navegador não suporta persistência offline.');
    }
});

const itensBody = document.getElementById("itens");
const totalGeral = document.getElementById("totalGeral");

document.addEventListener("DOMContentLoaded", () => {
    adicionarItem();
    carregarHistorico(); // Puxa os dados direto do Firebase ao carregar a página
});

document.getElementById("btnAdicionar").addEventListener("click", adicionarItem);

function adicionarItem() {
    const tr = document.createElement("tr");

    tr.innerHTML = `
        <td>
            <input type="number" class="item-input qtd" value="1" min="1">
        </td>
        <td>
            <input type="text" class="item-input descricao" placeholder="Descrição do serviço">
        </td>
        <td>
            <input type="number" class="item-input unitario" value="0" step="0.01">
        </td>
        <td class="valorTotal">
            R$ 0,00
        </td>
        <td>
            <button class="btn-remover">X</button>
        </td>
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

function calcularTudo() {
    let total = 0;

    document.querySelectorAll("#itens tr").forEach(tr => {
        const qtd = parseFloat(tr.querySelector(".qtd").value) || 0;
        const unitario = parseFloat(tr.querySelector(".unitario").value) || 0;
        const subtotal = qtd * unitario;

        tr.querySelector(".valorTotal").innerText =
            subtotal.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL"
            });

        total += subtotal;
    });

    totalGeral.innerText =
        total.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
}

document.getElementById("salvarPedido").addEventListener("click", salvarPedido);

// 1. SALVAR NO FIREBASE (COM SUPORTE OFFLINE)
async function salvarPedido() {
    const cliente = document.getElementById("cliente").value;

    if (!cliente) {
        alert("Informe o cliente.");
        return;
    }

    // Captura dinamicamente todos os itens de serviços adicionados na tabela
    const listaItens = [];
    document.querySelectorAll("#itens tr").forEach(tr => {
        const qtd = tr.querySelector(".qtd").value;
        const desc = tr.querySelector(".descricao").value;
        const unit = tr.querySelector(".unitario").value;
        const tot = tr.querySelector(".valorTotal").innerText;
        
        if (desc) { // Só valida e adiciona se houver descrição digitada
            listaItens.push({
                qtd: qtd,
                descricao: desc,
                unitario: unit,
                totalItem: tot
            });
        }
    });

    // Cria um número de pedido curto e único usando a marca de tempo atual
    const numeroPedido = Math.floor(Date.now() / 1000).toString().slice(-5);

    const pedido = {
        numero: numeroPedido,
        cliente: cliente,
        telefone: document.getElementById("telefone").value,
        endereco: document.getElementById("endereco") ? document.getElementById("endereco").value : "",
        cidade: document.getElementById("cidade").value,
        data: document.getElementById("data").value,
        tipo: document.getElementById("tipo").value,
        entrada: document.getElementById("entrada") ? document.getElementById("entrada").value : "",
        formaPagamento: document.getElementById("pagamento") ? document.getElementById("pagamento").value : "",
        observacoes: document.getElementById("observacoes") ? document.getElementById("observacoes").value : "",
        total: totalGeral.innerText,
        itens: listaItens,
        criadoEm: firebase.firestore.FieldValue.serverTimestamp() // Define a ordem cronológica perfeita
    };

    try {
        // Envia direto para a coleção "pedidos" do Cloud Firestore
        await db.collection("pedidos").add(pedido);
        alert("Pedido salvo com sucesso!");

        // Reseta os campos do formulário para o próximo orçamento
        document.getElementById("cliente").value = "";
        document.getElementById("telefone").value = "";
        if(document.getElementById("endereco")) document.getElementById("endereco").value = "";
        if(document.getElementById("entrada")) document.getElementById("entrada").value = "";
        if(document.getElementById("pagamento")) document.getElementById("pagamento").value = "";
        if(document.getElementById("observacoes")) document.getElementById("observacoes").value = "";
        itensBody.innerHTML = "";
        
        adicionarItem(); // Deixa uma linha limpa pronta
        carregarHistorico(); // Atualiza a lista na tela de forma assíncrona
    } catch (error) {
        console.error("Erro ao salvar pedido:", error);
        alert("Erro ao salvar no banco de dados.");
    }
}

// 2. CARREGAR HISTÓRICO EM TEMPO REAL OU CACHE DE TODOS OS PEDIDOS
// CARREGAR HISTÓRICO DA NUVEM (Com botão de abrir PDF integrado)
function carregarHistorico() {
    const historico = document.getElementById("historico");
    historico.innerHTML = "";
    db.collection("pedidos").orderBy("criadoEm", "desc").get().then((snapshot) => {
        snapshot.forEach((doc) => {
            const pedido = doc.data();
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${pedido.numero || '---'}</td>
                <td>${pedido.cliente}</td>
                <td>${pedido.data}</td>
                <td>${pedido.total}</td>
                <td>
                    <button class="btn-pdf" data-id="${doc.id}" style="background:#007bff;color:white;border:none;padding:4px 8px;border-radius:4px;cursor:pointer;margin-right:5px;">
                        Ver PDF
                    </button>
                    <button class="btn-excluir" data-id="${doc.id}" style="background:#ff4d4d;color:white;border:none;padding:4px 8px;border-radius:4px;cursor:pointer;">
                        Excluir
                    </button>
                </td>
            `;

            // Ação do Botão Ver PDF (Chama a função criada no pdf.js)
            tr.querySelector(".btn-pdf").addEventListener("click", function() {
                visualizarPedidoPdf(this.getAttribute("data-id"));
            });

            // Ação do Botão Excluir
            tr.querySelector(".btn-excluir").addEventListener("click", function() {
                excluirPedido(this.getAttribute("data-id"));
            });

            historico.appendChild(tr);
        });
    });
}

// 3. REMOVER PEDIDO PERMANENTEMENTE DO FIREBASE
async function excluirPedido(idDocumento) {
    if (confirm("Tem certeza que deseja apagar este orçamento definitivamente do banco de dados?")) {
        try {
            await db.collection("pedidos").doc(idDocumento).delete();
            alert("Pedido removido com sucesso.");
            carregarHistorico(); // Recarrega a tabela de visualização
        } catch (error) {
            console.error("Erro ao deletar do Firebase:", error);
            alert("Não foi possível excluir o registro.");
        }
    }
}

// Mecanismo de filtragem em tempo real na barra de pesquisas
document.getElementById("pesquisa").addEventListener("keyup", function () {
    const filtro = this.value.toLowerCase();

    document.querySelectorAll("#historico tr").forEach(linha => {
        linha.style.display =
            linha.innerText.toLowerCase().includes(filtro)
                ? ""
                : "none";
    });
});

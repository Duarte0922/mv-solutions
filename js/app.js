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
const storage = firebase.storage(); // Inicializa o Storage corretamente

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
        alert("Salvo com sucesso!");
        limparFormulario();
        carregarHistorico();
    } catch (error) {
        alert("Erro ao salvar.");
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
            alert("Atualizado com sucesso!");
            limparFormulario();
            carregarHistorico();
        } catch (error) {
            alert("Erro ao atualizar.");
        }
    });
}

// PUXAR DADOS DO HISTÓRICO PARA A TELA AO CLICAR
async function carregarPedidoParaEdicao(idDocumento) {
    try {
        const doc = await db.collection("pedidos").doc(idDocumento).get();
        if (!doc.exists) { alert("Documento não encontrado."); return; }
        
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
        if (pedido.itens && Array.isArray(pedido.itens) && pedido.itens.length > 0) {
            pedido.itens.forEach(item => {
                adicionarItem(item.qtd, item.descricao, item.unitario);
            });
        } else {
            adicionarItem();
        }

        if(document.getElementById("atualizarPedido")) {
            document.getElementById("atualizarPedido").style.display = "inline-block";
        }
        document.getElementById("salvarPedido").innerText = "Salvar como Novo (Clonar)";
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
        console.error(error);
        alert("Erro ao carregar os dados.");
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
    if (confirm("Deseja excluir definitivamente?")) {
        await db.collection("pedidos").doc(idDocumento).delete();
        alert("Excluído com sucesso.");
        limparFormulario();
        carregarHistorico();
    }
}

// NOVO BOTÃO WHATSAPP ATUALIZADO: SUPORTA ORÇAMENTOS, PEDIDOS E RECIBOS COM SUA LOGO
document.getElementById("enviarWhats").addEventListener("click", async () => {
    const cliente = document.getElementById("cliente").value;
    const telefoneRaw = document.getElementById("telefone").value.replace(/\D/g, "");
    const tipo = document.getElementById("tipo").value;
    const data = document.getElementById("data").value;
    const total = totalGeral.innerText;
    const itens = obterItensDoFormulario();

    if (!cliente) { alert("Informe o cliente antes de enviar."); return; }
    if (itens.length === 0) { alert("Adicione ao menos um item."); return; }

    const botao = document.getElementById("enviarWhats");
    const textoOriginal = botao.innerText;
    botao.innerText = "Processando PDF...";
    botao.disabled = true;

    try {
        // Correção do construtor jsPDF para carregar no escopo do app.js
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        const dadosPedido = {
            numero: Math.floor(Date.now() / 1000).toString().slice(-5),
            cliente, 
            telefone: document.getElementById("telefone").value,
            endereco: document.getElementById("endereco").value,
            cidade: document.getElementById("cidade").value,
            data, tipo, total, itens,
            entrada: document.getElementById("entrada").value || "R$ 0,00",
            formaPagamento: document.getElementById("pagamento").value || "---",
            observacoes: document.getElementById("observacoes").value
        };

        // Renderiza o desenho idêntico usando a função do seu arquivo pdf.js
        const carregarLogoEDesenhar = () => {
            return new Promise((resolve) => {
                const img = new Image();
                img.crossOrigin = "Anonymous";
                img.src = "https://duarte0922.github.io/mv-solutions/assets/logo.jpeg";
                
                img.onload = () => {
                    desenharConteudo(doc, img, dadosPedido, false);
                    resolve();
                };
                img.onerror = () => {
                    desenharConteudo(doc, null, dadosPedido, false);
                    resolve();
                };
            });
        };

        await carregarLogoEDesenhar();

        // Envia o PDF para o Firebase Storage
        const pdfBlob = doc.output('blob');
        const nomeArquivo = `pdfs/${dadosPedido.numero}_${Date.now()}.pdf`;
        const storageRef = storage.ref().child(nomeArquivo);

        const snapshot = await storageRef.put(pdfBlob);
        const urlPublicaPdf = await snapshot.ref.getDownloadURL();

        // Salva os registros completos no Firestore
        dadosPedido.urlPdf = urlPublicaPdf;
        dadosPedido.criadoEm = firebase.firestore.FieldValue.serverTimestamp();
        await db.collection("pedidos").add(dadosPedido);

        // Monta texto dinâmico dependendo do tipo (Orçamento, Pedido ou Recibo)
        let mensagem = `Olá ${cliente}! Segue o link do seu *${tipo}* da MV Solutions:\n\n`;
        mensagem += `*Resumo:*\n`;
        itens.forEach(item => {
            mensagem += `• ${item.qtd}x ${item.descricao} - ${item.totalItem}\n`;
        });
        mensagem += `\n*Total Geral: ${total}*\n`;
        
        if (tipo === "Recibo" && dadosPedido.entrada !== "R$ 0,00") {
            mensagem += `*Valor Recebido: ${dadosPedido.entrada}*\n`;
        }
        
        mensagem += `\n👉 Clique no link para abrir o PDF original:\n${urlPublicaPdf}`;

        let link;
        if (telefoneRaw) {
            const numeroCompleto = telefoneRaw.length <= 11 ? `55${telefoneRaw}` : telefoneRaw;
            link = `https://wa.me/${numeroCompleto}?text=${encodeURIComponent(mensagem)}`;
        } else {
            link = `https://wa.me/?text=${encodeURIComponent(mensagem)}`;
        }

        window.open(link, "_blank");
        carregarHistorico();

    } catch (error) {
        console.error(error);
        alert("Erro ao processar o arquivo.");
    } finally {
        botao.innerText = textoOriginal;
        botao.disabled = false;
    }
});
// FUNÇÃO EXCLUSIVA PARA GERAR RECIBO PROFISSIONAL COM LOGO E CABEÇALHO
async function gerarReciboPdf() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Coleta os dados direto da tela
    const cliente = document.getElementById("cliente").value;
    const dataFormatada = document.getElementById("data").value.split('-').reverse().join('/');
    const valorRecibo = document.getElementById("entrada").value || document.getElementById("totalGeral").innerText;
    const observacoes = document.getElementById("observacoes").value || "Referente aos serviços prestados descritos em orçamento.";
    const cidade = document.getElementById("cidade").value || "Belo Horizonte";
    const numeroRecibo = Math.floor(Date.now() / 1000).toString().slice(-5);

    if (!cliente) {
        alert("Por favor, preencha o nome do cliente para gerar o recibo.");
        return;
    }

    // Função interna para desenhar o cabeçalho padrão idêntico ao seu pdf.js
    const desenharCabecalhoRecibo = (imgLogo) => {
        // Linha decorativa azul do topo
        doc.setFillColor(18, 38, 58);
        doc.rect(0, 0, 210, 8, "F");

        // Desenha a logo se ela carregar corretamente
        if (imgLogo) {
            doc.addImage(imgLogo, "JPEG", 15, 15, 35, 35);
        }

        // Dados da Empresa (Cabeçalho Padrão MV Solutions)
        doc.setTextColor(18, 38, 58);
        doc.setFont("headline", "bold");
        doc.setFontSize(22);
        doc.text("MV Solutions", 55, 25);

        doc.setFontSize(10);
        doc.setFont("headline", "normal");
        doc.setTextColor(80, 80, 80);
        doc.text("Soluções Inteligentes para o seu Empreendimento", 55, 31);
        doc.text("Contato: (31) 98827-5579", 55, 37);
        doc.text("E-mail: marcellocalhas@hotmail.com", 55, 42);
        doc.text("Instagram: @marcellosolucoes", 55, 47);

        // Linha divisória cinza
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.5);
        doc.line(15, 55, 195, 55);
    };

    // Criar uma promessa para carregar a imagem da logo antes de montar o documento
    const carregarLogo = new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = "https://duarte0922.github.io/mv-solutions/assets/logo.jpeg";
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null); // Se falhar, gera sem logo mas não trava o app
    });

    const imgLogo = await carregarLogo;
    desenharCabecalhoRecibo(imgLogo);

    // --- CORPO DO RECIBO ---
    
    // Título Centralizado
    doc.setFont("headline", "bold");
    doc.setFontSize(20);
    doc.setTextColor(18, 38, 58);
    doc.text(`RECIBO DE PAGAMENTO - Nº ${numeroRecibo}`, 105, 70, { align: "center" });

    // Caixa de Destaque do Valor
    doc.setFillColor(240, 244, 248);
    doc.rect(135, 80, 60, 14, "F");
    doc.setDrawColor(18, 38, 58);
    doc.setLineWidth(1);
    doc.rect(135, 80, 60, 14, "S");
    
    doc.setFontSize(14);
    doc.setTextColor(18, 38, 58);
    doc.text(`VALOR: ${valorRecibo}`, 140, 89);

    // Texto descritivo formal do recibo
    doc.setFont("headline", "normal");
    doc.setFontSize(12);
    doc.setTextColor(40, 40, 40);
    
    let textoRecibo = `Recebemos de ${cliente.toUpperCase()}, a importância de ${valorRecibo} (${observacoes}).`;
    
    // Divide o texto para caber perfeitamente na folha sem estourar as margens
    const linhasTexto = doc.splitTextToSize(textoRecibo, 180);
    doc.text(linhasTexto, 15, 110);

    // Data e Cidade por extenso
    doc.text(`${cidade}, ${dataFormatada}.`, 15, 145);

    // Área de Assinatura da Empresa
    doc.line(60, 190, 150, 190); // Linha da assinatura
    doc.setFont("headline", "bold");
    doc.text("MV SOLUTIONS", 105, 197, { align: "center" });
    doc.setFont("headline", "normal");
    doc.setFontSize(10);
    doc.text("Emitente", 105, 202, { align: "center" });

    // Abre a visualização/impressão do PDF na hora
    doc.output("dataurlnewwindow");
}
// CONTROLE DOS NOVOS BOTÕES DE SELEÇÃO (ORÇAMENTO / PEDIDO / RECIBO)
const btnOrcamento = document.getElementById("btnTipoOrcamento");
const btnPedido = document.getElementById("btnTipoPedido");
const btnRecibo = document.getElementById("btnTipoRecibo");
const inputTipo = document.getElementById("tipo");

function alternarTipoDocumento(tipoSelecionado) {
    // Atualiza o valor do input oculto que o restante do sistema lê
    inputTipo.value = tipoSelecionado;

    // Reseta o visual de todos os botões para o estado inativo
    [btnOrcamento, btnPedido, btnRecibo].forEach(btn => {
        if(btn) {
            btn.style.backgroundColor = "#1e293b";
            btn.style.color = "#94a3b8";
            btn.style.border = "none";
        }
    });

    // Aplica o visual ativo (Azul MV Solutions) no botão clicado
    let btnAtivo = btnOrcamento;
    if (tipoSelecionado === "Pedido") btnAtivo = btnPedido;
    if (tipoSelecionado === "Recibo") btnAtivo = btnRecibo;

    if(btnAtivo) {
        btnAtivo.style.backgroundColor = "#12263a";
        btnAtivo.style.color = "#ffffff";
        btnAtivo.style.border = "1px solid #007bff";
    }
    }

    // Vincula os eventos de clique aos botões do cabeçalho
    if(btnOrcamento) btnOrcamento.addEventListener("click", () => alternarTipoDocumento("Orçamento"));
    if(btnPedido) btnPedido.addEventListener("click", () => alternarTipoDocumento("Pedido"));
    if(btnRecibo) btnRecibo.addEventListener("click", () => alternarTipoDocumento("Recibo"));

    // Modifique sua função limparFormulario() existente para resetar os botões visualmente também
    const funcaoLimparOriginal = limparFormulario;
    limparFormulario = function() {
        funcaoLimparOriginal();
        alternarTipoDocumento("Orçamento"); // Volta o botão para Orçamento por padrão ao limpar
    }

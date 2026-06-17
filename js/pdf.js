// Garante o carregamento correto do jsPDF
window.jsPDF = window.jspdf.jsPDF;

// ESCUTADOR DO BOTÃO GERAR PDF DA TELA PRINCIPAL
document.getElementById("gerarPDF").addEventListener("click", () => {
    const dados = {
        numero: Math.floor(Date.now() / 1000).toString().slice(-5),
        cliente: document.getElementById("cliente").value,
        telefone: document.getElementById("telefone").value,
        endereco: document.getElementById("endereco").value,
        cidade: document.getElementById("cidade").value,
        data: document.getElementById("data").value,
        tipo: document.getElementById("tipo").value,
        entrada: document.getElementById("entrada").value,
        formaPagamento: document.getElementById("pagamento").value,
        observacoes: document.getElementById("observacoes").value,
        total: document.getElementById("totalGeral").innerText,
        itens: []
    };

    // Captura os itens da tabela ativa
    document.querySelectorAll("#itens tr").forEach(tr => {
        const qtd = tr.querySelector(".qtd").value;
        const desc = tr.querySelector(".descricao").value;
        const unit = tr.querySelector(".unitario").value;
        const tot = tr.querySelector(".valorTotal").innerText;
        if (desc) {
            dados.itens.push({ qtd, descricao: desc, unitario: unit, totalItem: tot });
        }
    });

    if (!dados.cliente) {
        alert("Preencha o nome do cliente para gerar o PDF.");
        return;
    }

    gerarDocumentoPDF(dados);
});

// FUNÇÃO ESTRUTURAL QUE DESENHA O PDF
function gerarDocumentoPDF(pedido) {
    const doc = new jsPDF();

    // Cabeçalho da Empresa
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(22);
    doc.text("MV SOLUTIONS", 14, 25);
    
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Soluções Inteligentes para o seu Empreendimento", 14, 32);
    doc.text("WhatsApp: (31) 98827-5579 | marcellocalhas@hotmail.com", 14, 38);
    doc.text("Instagram: @marcellosolucoes", 14, 44);

    // Linha divisória
    doc.setLineWidth(0.5);
    doc.line(14, 48, 196, 48);

    // Título do Documento
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(16);
    doc.text(`${pedido.tipo.toUpperCase()} N° ${pedido.numero}`, 14, 58);

    // Dados do Cliente
    doc.setFontSize(11);
    doc.text("DADOS DO CLIENTE", 14, 68);
    doc.setFont("Helvetica", "normal");
    doc.text(`Cliente: ${pedido.cliente || '---'}`, 14, 75);
    doc.text(`Telefone: ${pedido.telefone || '---'}`, 14, 81);
    doc.text(`Endereço: ${pedido.endereco || '---'} - ${pedido.cidade || ''}`, 14, 87);
    doc.text(`Data: ${pedido.data || '---'}`, 14, 93);

    // Linha divisória antes dos Itens
    doc.line(14, 98, 196, 98);

    // Itens
    doc.setFont("Helvetica", "bold");
    doc.text("ITENS DO SERVIÇO", 14, 105);
    
    doc.setFont("Helvetica", "normal");
    let linhaAtual = 113;

    pedido.itens.forEach((item) => {
        doc.text(`${item.qtd}x   ${item.descricao}`, 14, linhaAtual);
        doc.text(`${item.totalItem}`, 170, linhaAtual, { align: "right" });
        linhaAtual += 8;
    });

    // Linha divisória antes do Total
    doc.line(14, linhaAtual + 2, 196, linhaAtual + 2);
    linhaAtual += 10;

    // Bloco de Fechamento e Valores
    doc.setFont("Helvetica", "bold");
    doc.text(`TOTAL GERAL: ${pedido.total}`, 14, linhaAtual);
    
    linhaAtual += 8;
    doc.setFont("Helvetica", "normal");
    doc.text(`Entrada: ${pedido.entrada || 'R$ 0,00'}`, 14, linhaAtual);
    doc.text(`Forma de Pagamento: ${pedido.formaPagamento || '---'}`, 100, linhaAtual);
    
    if (pedido.observacoes) {
        linhaAtual += 8;
        doc.text(`Observações: ${pedido.observacoes}`, 14, linhaAtual);
    }

    // Campo de Assinatura no rodapé
    doc.line(50, 260, 160, 260);
    doc.text("Assinatura do Cliente", 105, 266, { align: "center" });

    // Baixa o arquivo automaticamente
    doc.save(`${pedido.tipo}_${pedido.cliente}.pdf`);
}

// FUNÇÃO PARA ABRIR E REGERAR O PDF DIRETO DO HISTÓRICO
async function visualizarPedidoPdf(idDocumento) {
    try {
        const docRef = await db.collection("pedidos").doc(idDocumento).get();
        if (docRef.exists) {
            const pedidoDados = docRef.data();
            gerarDocumentoPDF(pedidoDados);
        } else {
            alert("Pedido não encontrado no banco.");
        }
    } catch (error) {
        alert("Erro ao carregar dados do PDF.");
    }
}

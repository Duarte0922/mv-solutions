// Garante o carregamento correto do jsPDF
window.jsPDF = window.jspdf.jsPDF;

// Link direto e seguro da logo para carregar direto no GitHub Pages ou Localmente
const LOGO_URL = "https://duarte0922.github.io/mv-solutions/assets/logo.png";

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

    // Chama a função unificada passando true para baixar direto
    gerarDocumentoPDF(dados, true);
});

// FUNÇÃO PARA ABRIR E REGERAR O PDF DIRETO DO HISTÓRICO
async function visualizarPedidoPdf(idDocumento) {
    try {
        const docSnap = await db.collection("pedidos").doc(idDocumento).get();
        if (!docSnap.exists) { alert("Pedido não encontrado."); return; }
        const pedido = docSnap.data();

        // Adapta os campos do Firebase para bater com a estrutura da função de desenho
        const dadosPedido = {
            numero: pedido.numero || '---',
            cliente: pedido.cliente || '---',
            telefone: pedido.telefone || '---',
            endereco: pedido.endereco || '---',
            cidade: pedido.cidade || '',
            data: pedido.data || '---',
            tipo: pedido.tipo || 'Orçamento',
            entrada: pedido.entrada || 'R$ 0,00',
            formaPagamento: pedido.formaPagamento || '---',
            observacoes: pedido.observacoes || '',
            total: pedido.total || 'R$ 0,00',
            itens: pedido.itens || []
        };

        // Chama a função unificada passando false para abrir em nova aba
        gerarDocumentoPDF(dadosPedido, false);

    } catch (error) {
        console.error("Erro geral no PDF do histórico:", error);
        alert("Erro ao recuperar arquivo do histórico.");
    }
}

// 🛠️ FUNÇÃO ÚNICA ESTRUTURAL QUE DESENHA O LAYOUT DO PDF (Com Logo)
function gerarDocumentoPDF(pedido, baixarDireto = true) {
    const doc = new jsPDF();

    // Cria o elemento de imagem em memória para carregar o arquivo da pasta assets
    const img = new Image();
    img.crossOrigin = "Anonymous"; // Evita bloqueios de segurança do navegador
    img.src = LOGO_URL;

    // Aguarda a imagem carregar antes de montar o PDF
    img.onload = function() {
        desenharConteudo(doc, img, pedido, baixarDireto);
    };

    img.onerror = function() {
        console.log("Não foi possível carregar a logo pelo link, gerando sem imagem...");
        desenharConteudo(doc, null, pedido, baixarDireto);
    };
}

// Desenha elementos, textos e tabelas dentro do documento
function desenharConteudo(doc, imgElement, pedido, baixarDireto) {
    let inicioTextoX = 14;

    // Se a imagem carregou com sucesso, renderiza ela e joga o texto do cabeçalho pro lado
    if (imgElement) {
        // addImage(imagem, formato, x, y, largura, altura)
        doc.addImage(imgElement, 'PNG', 14, 15, 38, 30);
        inicioTextoX = 58; // Desloca os textos para não ficar em cima da imagem
    }

    // Cabeçalho da Empresa (Alinhado)
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(22);
    doc.text("MV SOLUTIONS", inicioTextoX, 25);
    
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Soluções Inteligentes para o seu Empreendimento", inicioTextoX, 32);
    doc.text("WhatsApp: (31) 98827-5579 | marcellocalhas@hotmail.com", inicioTextoX, 38);
    doc.text("Instagram: @marcellosolucoes", inicioTextoX, 44);

    // Linha divisória
    doc.setLineWidth(0.5);
    doc.line(14, 49, 196, 49);

    // Título do Documento
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(16);
    doc.text(`${pedido.tipo.toUpperCase()} N° ${pedido.numero}`, 14, 59);

    // Dados do Cliente
    doc.setFontSize(11);
    doc.text("DADOS DO CLIENTE", 14, 69);
    doc.setFont("Helvetica", "normal");
    doc.text(`Cliente: ${pedido.cliente}`, 14, 76);
    doc.text(`Telefone: ${pedido.telefone}`, 14, 82);
    doc.text(`Endereço: ${pedido.endereco} - ${pedido.cidade}`, 14, 88);
    doc.text(`Data: ${pedido.data}`, 14, 94);

    // Linha divisória antes dos Itens
    doc.line(14, 99, 196, 99);

    // Itens
    doc.setFont("Helvetica", "bold");
    doc.text("ITENS DO SERVIÇO", 14, 106);
    
    doc.setFont("Helvetica", "normal");
    let linhaAtual = 114;

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
    doc.text(`Entrada: ${pedido.entrada}`, 14, linhaAtual);
    doc.text(`Forma de Pagamento: ${pedido.formaPagamento}`, 100, linhaAtual);
    
    if (pedido.observacoes) {
        linhaAtual += 8;
        doc.text(`Observações: ${pedido.observacoes}`, 14, linhaAtual);
    }

    // Campo de Assinatura no rodapé
    doc.line(50, 260, 160, 260);
    doc.text("Assinatura do Cliente", 105, 266, { align: "center" });

    // Decide se faz o download automático ou se abre na tela
    if (baixarDireto) {
        doc.save(`${pedido.tipo}_${pedido.cliente}.pdf`);
    } else {
        window.open(doc.output('bloburl'), '_blank');
    }
}

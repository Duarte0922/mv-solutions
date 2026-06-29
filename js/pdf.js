// Garante o carregamento correto do jsPDF
window.jsPDF = window.jspdf.jsPDF;

// Link direto e seguro da logo para carregar direto no GitHub Pages ou Localmente
const LOGO_URL = "https://duarte0922.github.io/mv-solutions/assets/logo.jpeg";

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

// ️ FUNÇÃO ÚNICA ESTRUTURAL QUE DESENHA O LAYOUT DO PDF (Com Logo)
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
    const larguraPagina = 196; // Largura útil da página A4
    const margemEsquerda = 14;
    const espacamento = 7; // Espaçamento padrão entre linhas

    // Se a imagem carregou com sucesso, renderiza ela e joga o texto do cabeçalho pro lado
    if (imgElement) {
        doc.addImage(imgElement, 'PNG', 14, 15, 38, 30);
        inicioTextoX = 58;
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
    doc.setFont("Helvetica", "bold");
    doc.text("DADOS DO CLIENTE", 14, 69);
    doc.setFont("Helvetica", "normal");
    
    let linhaAtual = 76;
    
    // Cliente com quebra de linha
    const clienteLinhas = doc.splitTextToSize(`Cliente: ${pedido.cliente}`, larguraPagina - 14);
    doc.text(clienteLinhas, 14, linhaAtual);
    linhaAtual += espacamento * clienteLinhas.length;
    
    // Telefone com quebra de linha
    const telefoneLinhas = doc.splitTextToSize(`Telefone: ${pedido.telefone}`, larguraPagina - 14);
    doc.text(telefoneLinhas, 14, linhaAtual);
    linhaAtual += espacamento * telefoneLinhas.length;
    
    // Endereço com quebra de linha
    const enderecoCompleto = `Endereço: ${pedido.endereco} - ${pedido.cidade}`;
    const enderecoLinhas = doc.splitTextToSize(enderecoCompleto, larguraPagina - 14);
    doc.text(enderecoLinhas, 14, linhaAtual);
    linhaAtual += espacamento * enderecoLinhas.length;
    
    // Data com quebra de linha
    const dataLinhas = doc.splitTextToSize(`Data: ${pedido.data}`, larguraPagina - 14);
    doc.text(dataLinhas, 14, linhaAtual);
    linhaAtual += espacamento * dataLinhas.length + 4;

    // Linha divisória antes dos Itens
    doc.line(14, linhaAtual, 196, linhaAtual);
    linhaAtual += 7;

    // Itens
    doc.setFont("Helvetica", "bold");
    doc.text("ITENS DO SERVIÇO", 14, linhaAtual);
    linhaAtual += 8;
    
    doc.setFont("Helvetica", "normal");

    pedido.itens.forEach((item) => {
        // Quebra a descrição se for muito longa
        const descricaoCompleta = `${item.qtd}x ${item.descricao}`;
        const descricaoLinhas = doc.splitTextToSize(descricaoCompleta, 140);
        
        doc.text(descricaoLinhas, 14, linhaAtual);
        doc.text(`${item.totalItem}`, 190, linhaAtual, { align: "right" });
        
        linhaAtual += 7 * descricaoLinhas.length;
    });

    // Linha divisória antes do Total
    doc.line(14, linhaAtual + 2, 196, linhaAtual + 2);
    linhaAtual += 12;

    // TOTAL GERAL DESTACADO
    doc.setFillColor(240, 240, 240);
    doc.rect(14, linhaAtual - 5, 182, 12, 'F');
    
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text(`TOTAL GERAL: ${pedido.total}`, 14, linhaAtual + 5);
    
    doc.setTextColor(0, 0, 0);
    linhaAtual += 18;
    
    // Informações de Pagamento COM QUEBRA DE LINHA
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(11);
    
    // Entrada com quebra de linha automática
    const entradaTexto = `Entrada: ${pedido.entrada}`;
    const entradaLinhas = doc.splitTextToSize(entradaTexto, larguraPagina - 14);
    doc.text(entradaLinhas, 14, linhaAtual);
    linhaAtual += espacamento * entradaLinhas.length;
    
    // Forma de Pagamento com quebra de linha automática
    const pagamentoTexto = `Restante: ${pedido.formaPagamento}`;
    const pagamentoLinhas = doc.splitTextToSize(pagamentoTexto, larguraPagina - 14);
    doc.text(pagamentoLinhas, 14, linhaAtual);
    linhaAtual += espacamento * pagamentoLinhas.length;
    
    // Observações com quebra de linha automática
    if (pedido.observacoes) {
        linhaAtual += 2;
        const obsLinhas = doc.splitTextToSize(`Observações: ${pedido.observacoes}`, larguraPagina - 14);
        doc.setFont("Helvetica", "italic");
        doc.setFontSize(10);
        doc.text(obsLinhas, 14, linhaAtual);
        linhaAtual += 6 * obsLinhas.length;
    }

    // Campo de Assinatura no rodapé
    doc.setLineWidth(0.5);
    doc.line(50, 260, 160, 260);
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Assinatura do Cliente", 105, 266, { align: "center" });

    // Decide se faz o download automático ou se abre na tela
    if (baixarDireto) {
        doc.save(`${pedido.tipo}_${pedido.cliente}.pdf`);
    } else {
        window.open(doc.output('bloburl'), '_blank');
    }
}

// Garante o carregamento correto do jsPDF
window.jsPDF = window.jspdf.jsPDF;

// Link direto e seguro da logo
const LOGO_URL = "https://duarte0922.github.io/mv-solutions/assets/logo.jpeg";

// ESCUTADOR DO BOTÃO GERAR PDF
document.getElementById("gerarPDF").addEventListener("click", () => {
    const tipo = document.getElementById("tipo").value;

    if (tipo === "Recibo") {
        gerarReciboPdf();
        return;
    }

    const dados = {
        numero: Math.floor(Date.now() / 1000).toString().slice(-5),
        cliente: document.getElementById("cliente").value,
        telefone: document.getElementById("telefone").value,
        endereco: document.getElementById("endereco").value,
        cidade: document.getElementById("cidade").value,
        data: document.getElementById("data").value,
        tipo: tipo,
        entrada: document.getElementById("entrada").value,
        formaPagamento: document.getElementById("pagamento").value,
        observacoes: document.getElementById("observacoes").value,
        total: document.getElementById("totalGeral").innerText,
        itens: []
    };

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

    gerarDocumentoPDF(dados, true);
});

// FUNÇÃO PARA GERAR O RECIBO
async function gerarReciboPdf() {
    const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a5"
    });

    const cliente = (document.getElementById("cliente").value || "").toUpperCase();
    const dataInput = document.getElementById("data").value;
    const valorRecibo = document.getElementById("entrada").value || document.getElementById("totalGeral").innerText || "R$ 0,00";
    const observacoes = document.getElementById("observacoes").value || "Serviços prestados.";
    const cidade = document.getElementById("cidade").value || "Belo Horizonte";

    if (!cliente) {
        alert("Por favor, preencha o nome do cliente.");
        return;
    }

    let dia = "__", mes = "___________", ano = "20__";
    if (dataInput) {
        const partesData = dataInput.split("-");
        dia = partesData[2];
        const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
        mes = meses[parseInt(partesData[1]) - 1];
        ano = partesData[0];
    }

    const carregarLogo = new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = LOGO_URL;
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
    });

    const imgLogo = await carregarLogo;

    // CABEÇALHO
    doc.setFillColor(18, 38, 58);
    doc.rect(0, 0, 210, 4, "F");

    if (imgLogo) {
        doc.addImage(imgLogo, "JPEG", 10, 8, 25, 25);
    }

    doc.setTextColor(18, 38, 58);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(16);
    doc.text("MV Solutions", 40, 15);
    
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text("Soluções Inteligentes para o seu Empreendimento", 40, 20);
    doc.text("Contato: (31) 98827-5579 | marcellocalhas@hotmail.com", 40, 25);
    doc.text("Instagram: @marcellosolucoes", 40, 30);

    doc.setDrawColor(120, 130, 140);
    doc.setLineWidth(1);
    doc.line(10, 36, 200, 36);

    // CORPO DO RECIBO
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(18, 38, 58);
    doc.text("RECIBO", 10, 48);

    // === RETÂNGULO DO VALOR AJUSTADO ===
// Retângulo do Valor - DOBRO NA LARGURA, TEXTO EM 2 LINHAS
const valorTexto = `R$ ${valorRecibo}`;
const larguraRetangulo = 110; // DOBRO: era 55, agora 110mm
const alturaRetangulo = 12;   // Altura para caber 2 linhas
const xPosRetangulo = 90;    // Posição X ajustada (mais à esquerda)
const yPosRetangulo = 40;

// Desenha o retângulo
doc.setFillColor(230, 235, 240);
doc.rect(xPosRetangulo, yPosRetangulo, larguraRetangulo, alturaRetangulo, "F");

// Fonte menor para caber em 2 linhas
doc.setFontSize(9);
doc.setFont("Helvetica", "bold");
doc.setTextColor(18, 38, 58);

// Quebra o texto para caber na largura
const valorQuebrado = doc.splitTextToSize(valorTexto, larguraRetangulo - 6);

// Centraliza verticalmente as 2 linhas dentro do retângulo
const espacamentoLinha = 4.5;
const numLinhas = Array.isArray(valorQuebrado) ? valorQuebrado.length : 1;
const alturaTotalTexto = numLinhas * espacamentoLinha;
const inicioY = yPosRetangulo + (alturaRetangulo - alturaTotalTexto) / 2 + espacamentoLinha;

// Desenha o texto quebrado
doc.text(valorQuebrado, xPosRetangulo + 3, inicioY);

    // Restante do recibo
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(50, 50, 50);

    let yPos = 65;
    const margemEsq = 10;
    const larguraTexto = 135;
    const xPosValor = 48;

    // 1. Recebi(emos) de
    doc.setFont("Helvetica", "bold");
    doc.text("Recebi(emos) de:", margemEsq, yPos);
    
    doc.setFont("Helvetica", "normal");
    const clienteLinhas = doc.splitTextToSize(cliente, larguraTexto);
    doc.text(clienteLinhas, xPosValor, yPos);
    yPos += (Array.isArray(clienteLinhas) ? clienteLinhas.length : 1) * 7 + 3;

    // 2. A importância de
    doc.setFont("Helvetica", "bold");
    doc.text("A importância de:", margemEsq, yPos);
    
    doc.setFont("Helvetica", "italic");
    const valorLinhas = doc.splitTextToSize(valorRecibo, larguraTexto);
    doc.text(valorLinhas, xPosValor, yPos);
    yPos += (Array.isArray(valorLinhas) ? valorLinhas.length : 1) * 7 + 3;

    // 3. Proveniente de
    doc.setFont("Helvetica", "bold");
    doc.text("Proveniente de:", margemEsq, yPos);
    
    doc.setFont("Helvetica", "normal");
    const obsLinhas = doc.splitTextToSize(observacoes, larguraTexto);
    doc.text(obsLinhas, xPosValor, yPos);
    yPos += (Array.isArray(obsLinhas) ? obsLinhas.length : 1) * 7 + 5;

    doc.text("para clareza firmo(amos) o presente.", margemEsq, yPos);
    yPos += 15;


    // Data
    const dataTexto = `${cidade}, ${dia} de ${mes} de ${ano}.`;
    doc.text(dataTexto, margemEsq, yPos);
    yPos += 5;  // ← REDUZIDO de 20 para 10 (sobe a assinatura)

    // Assinatura
    doc.line(120, yPos, 190, yPos);
    doc.setFontSize(10);
    doc.setFont("Helvetica", "bold");
    doc.text("Assinatura", 155, yPos + 5, { align: "center" });

    window.open(doc.output('bloburl'), '_blank');
}

// FUNÇÃO PARA VISUALIZAR DO HISTÓRICO
async function visualizarPedidoPdf(idDocumento) {
    try {
        const docSnap = await db.collection("pedidos").doc(idDocumento).get();
        if (!docSnap.exists) { alert("Pedido não encontrado."); return; }
        const pedido = docSnap.data();

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

        if (dadosPedido.tipo === "Recibo") {
            document.getElementById("cliente").value = dadosPedido.cliente;
            document.getElementById("data").value = dadosPedido.data;
            document.getElementById("entrada").value = dadosPedido.entrada;
            document.getElementById("observacoes").value = dadosPedido.observacoes;
            document.getElementById("cidade").value = dadosPedido.cidade;
            gerarReciboPdf();
        } else {
            gerarDocumentoPDF(dadosPedido, false);
        }

    } catch (error) {
        console.error("Erro:", error);
        alert("Erro ao recuperar arquivo.");
    }
}

// FUNÇÃO PRINCIPAL PARA GERAR PDF
function gerarDocumentoPDF(pedido, baixarDireto = true) {
    const doc = new jsPDF();
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = LOGO_URL;

    img.onload = function() {
        desenharConteudo(doc, img, pedido, baixarDireto);
    };
    img.onerror = function() {
        desenharConteudo(doc, null, pedido, baixarDireto);
    };
}

// FUNÇÃO QUE DESENHA O CONTEÚDO DO PDF
function desenharConteudo(doc, imgElement, pedido, baixarDireto) {
    let inicioTextoX = 14;
    if (imgElement) {
        doc.addImage(imgElement, 'JPEG', 14, 15, 38, 30);
        inicioTextoX = 58;
    }

    // Cabeçalho
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(22);
    doc.text("MV SOLUTIONS", inicioTextoX, 25);
    
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Soluções Inteligentes para o seu Empreendimento", inicioTextoX, 32);
    doc.text("WhatsApp: (31) 98827-5579 | marcellocalhas@hotmail.com", inicioTextoX, 38);
    doc.text("Instagram: @marcellosolucoes", inicioTextoX, 44);

    doc.setLineWidth(0.5);
    doc.line(14, 49, 196, 49);

    // Tipo e Número
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

    doc.line(14, 99, 196, 99);

    // Itens do Serviço
    doc.setFont("Helvetica", "bold");
    doc.text("ITENS DO SERVIÇO", 14, 106);
    
    doc.setFont("Helvetica", "normal");
    let linhaAtual = 114;
    const larguraDescricao = 115;
    const posXValor = 175;

    pedido.itens.forEach((item) => {
        const descricaoCompleta = `${item.qtd}x ${item.descricao}`;
        const descricaoQuebrada = doc.splitTextToSize(descricaoCompleta, larguraDescricao);
        
        doc.text(descricaoQuebrada, 14, linhaAtual);
        
        const numLinhas = Array.isArray(descricaoQuebrada) ? descricaoQuebrada.length : 1;
        doc.text(`${item.totalItem}`, posXValor, linhaAtual + (numLinhas - 1) * 5, { align: "right" });
        
        linhaAtual += (numLinhas * 6) + 2;
    });

    doc.line(14, linhaAtual + 2, 196, linhaAtual + 2);
    linhaAtual += 10;

    // Total
    doc.setFont("Helvetica", "bold");
    doc.text(`TOTAL GERAL: ${pedido.total}`, 14, linhaAtual);
    
    linhaAtual += 10;
    
    // Entrada - COM QUEBRA DE LINHA
    doc.setFont("Helvetica", "normal");
    const entradaTexto = `Entrada: ${pedido.entrada}`;
    const entradaQuebrada = doc.splitTextToSize(entradaTexto, 180);
    doc.text(entradaQuebrada, 14, linhaAtual);
    linhaAtual += (Array.isArray(entradaQuebrada) ? entradaQuebrada.length : 1) * 6 + 2;
    
    // Forma de Pagamento - EM NOVA LINHA
    const pagTexto = `Forma de Pagamento: ${pedido.formaPagamento}`;
    const pagQuebrada = doc.splitTextToSize(pagTexto, 180);
    doc.text(pagQuebrada, 14, linhaAtual);
    linhaAtual += (Array.isArray(pagQuebrada) ? pagQuebrada.length : 1) * 6 + 2;
    
    // Observações
    if (pedido.observacoes) {
        const obsQuebrada = doc.splitTextToSize(`Observações: ${pedido.observacoes}`, 180);
        doc.text(obsQuebrada, 14, linhaAtual);
        linhaAtual += (Array.isArray(obsQuebrada) ? obsQuebrada.length : 1) * 6 + 2;
    }

    // Assinatura
    doc.line(50, 260, 160, 260);
    doc.text("Assinatura do Emitente", 105, 266, { align: "center" });

    if (baixarDireto) {
        doc.save(`${pedido.tipo}_${pedido.cliente}.pdf`);
    } else {
        window.open(doc.output('bloburl'), '_blank');
    }
}

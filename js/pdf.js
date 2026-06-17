document.getElementById("gerarPDF").addEventListener("click", gerarPDF);

function gerarPDF() {

    const { jsPDF } = window.jspdf;

    const doc = new jsPDF();

    const cliente = document.getElementById("cliente").value;
    const telefone = document.getElementById("telefone").value;
    const data = document.getElementById("data").value;
    const tipo = document.getElementById("tipo").value;
    const entrada = document.getElementById("entrada").value;
    const pagamento = document.getElementById("pagamento").value;
    const observacoes = document.getElementById("observacoes").value;

    doc.setFontSize(20);
    doc.text("MV SOLUTIONS", 15, 20);

    doc.setFontSize(10);

    doc.text("Soluções Inteligentes para o seu Empreendimento", 15, 28);
    doc.text("WhatsApp: (31) 98827-5579", 15, 35);
    doc.text("Instagram: @marcellosolucoes", 15, 42);
    doc.text("Email: marcellocalhas@hotmail.com", 15, 49);

    doc.line(15, 55, 195, 55);

    doc.setFontSize(16);
    doc.text(tipo.toUpperCase(), 15, 65);

    doc.setFontSize(11);
    doc.text("Cliente: " + cliente, 15, 80);
    doc.text("Telefone: " + telefone, 15, 88);
    doc.text("Data: " + data, 15, 96);

    let y = 110;

    doc.text("Itens:", 15, y);

    y += 10;

    document.querySelectorAll("#itens tr").forEach(tr => {

        const qtd = tr.querySelector(".qtd").value;
        const descricao = tr.querySelector(".descricao").value;
        const unitario = tr.querySelector(".unitario").value;

        doc.text(
            `${qtd}x ${descricao} - R$ ${unitario}`,
            20,
            y
        );

        y += 8;
    });

    y += 10;

    doc.line(15, y, 195, y);

    y += 10;

    doc.setFontSize(14);

    doc.text(
        "TOTAL: " + document.getElementById("totalGeral").innerText,
        15,
        y
    );

    y += 12;

    doc.setFontSize(11);

    doc.text("Entrada: " + entrada, 15, y);

    y += 8;

    doc.text("Pagamento: " + pagamento, 15, y);

    y += 8;

    doc.text("Observações: " + observacoes, 15, y);

    y += 30;

    doc.line(60, y, 150, y);

    y += 8;

    doc.text("Assinatura do Cliente", 75, y);

    doc.save(`${tipo}_${cliente}.pdf`);
}
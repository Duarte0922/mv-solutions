
let contadorPedido = 1;

const itensBody = document.getElementById("itens");
const totalGeral = document.getElementById("totalGeral");

document.addEventListener("DOMContentLoaded", () => {
    adicionarItem();
    carregarHistorico();
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

function salvarPedido() {

    const cliente = document.getElementById("cliente").value;

    if (!cliente) {
        alert("Informe o cliente.");
        return;
    }

    let pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];

    const pedido = {
        numero: Date.now(),
        cliente: cliente,
        telefone: document.getElementById("telefone").value,
        cidade: document.getElementById("cidade").value,
        data: document.getElementById("data").value,
        tipo: document.getElementById("tipo").value,
        total: totalGeral.innerText
    };

    pedidos.push(pedido);

    localStorage.setItem("pedidos", JSON.stringify(pedidos));

    carregarHistorico();

    alert("Pedido salvo com sucesso.");
}

function carregarHistorico() {

    const historico = document.getElementById("historico");

    historico.innerHTML = "";

    let pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];

    pedidos.slice().reverse().forEach(pedido => {

        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${pedido.numero}</td>
            <td>${pedido.cliente}</td>
            <td>${pedido.data}</td>
            <td>${pedido.total}</td>
            <td>
                <button onclick="excluirPedido('${pedido.numero}')">
                    Excluir
                </button>
            </td>
        `;

        historico.appendChild(tr);
    });
}

function excluirPedido(numero) {

    let pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];

    pedidos = pedidos.filter(p => p.numero != numero);

    localStorage.setItem("pedidos", JSON.stringify(pedidos));

    carregarHistorico();
}

document.getElementById("pesquisa").addEventListener("keyup", function () {

    const filtro = this.value.toLowerCase();

    document.querySelectorAll("#historico tr").forEach(linha => {

        linha.style.display =
            linha.innerText.toLowerCase().includes(filtro)
                ? ""
                : "none";
    });

});
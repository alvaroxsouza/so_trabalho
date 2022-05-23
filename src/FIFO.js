// Test Setup
import { Processo } from "./Processo.js";

let tempoTotal = 0;

//Tempo total de execução
function listaDeProcessosFIFO(listaDeProcessos) {
    var tempoCorrente = 0;
    //sort para ordenar o tempo de chegada
    listaDeProcessos.sort(function(a, b) {
        if (a.tempoDeChegada > b.tempoDeChegada) { return 1; }
        if (a.tempoDeChegada < b.tempoDeChegada) { return -1; }
        return 0;
    });

    listaDeProcessos.forEach((processo) => {
        tempoCorrente += processo.tempoDeExecucao;
        tempoTotal += tempoCorrente - processo.tempoDeChegada;
        processo.turnAround = tempoCorrente;
        processo.tempoDeEspera = processo.turnAround - processo.tempoDeChegada - processo.tempoDeExecucao
    })
    return listaDeProcessos;
}

function findTurnAroundTime(quantidadeDeProcessos) {
    return (tempoTotal / quantidadeDeProcessos);
}

function main() {

    var teste = new Processo(1, 0, 10);
    var teste2 = new Processo(2, 2, 5);
    var teste3 = new Processo(3, 3, 8);

    let n = 3;

    var processes = new Array(n).fill(0);
    processes[0] = teste;
    processes[1] = teste2;
    processes[2] = teste3;

    //tempoDeExecucaoTotal (processes, n);
    console.log(listaDeProcessosFIFO(processes, n));
    console.log(tempoTotal)
    console.log(findTurnAroundTime(n));
}

main();

export { listaDeProcessosFIFO, findTurnAroundTime }
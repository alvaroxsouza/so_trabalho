// Test Setup
import { Processo } from "./Processo.js";

let tempoTotal = 0;

function listaDeProcessosFIFO(listaDeProcessos) {
    let tempoCorrente = 0;

    let listaDeRetangulos = [];

    listaDeProcessos.sort(function(a, b) {
        if (a.tempoDeChegada > b.tempoDeChegada) { return 1; }
        if (a.tempoDeChegada < b.tempoDeChegada) { return -1; }
        return 0;
    });

    listaDeProcessos.forEach((processo) => {
        if (processo.tempoDeChegada > tempoCorrente) {
            tempoCorrente += processo.tempoDeChegada - tempoCorrente;
        }

        let retangulo = {
            id: processo.id,
            tempoInicial: tempoCorrente,
            tempoFinal: 0
        }

        tempoCorrente += processo.tempoDeExecucao;
        tempoTotal += tempoCorrente - processo.tempoDeChegada;
        processo.turnAround = tempoCorrente;
        processo.tempoDeEspera = processo.turnAround - processo.tempoDeChegada - processo.tempoDeExecucao;

        retangulo.tempoFinal = tempoCorrente;
        listaDeRetangulos.push(retangulo)
    })
    return listaDeRetangulos;
}

function findTurnAroundTime(quantidadeDeProcessos) {
    return (tempoTotal / quantidadeDeProcessos);
}

export { listaDeProcessosFIFO, findTurnAroundTime }
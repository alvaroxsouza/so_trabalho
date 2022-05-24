// Test Setup
import { Processo } from "./Processo.js";

function listaDeProcessosFIFO(listaDeProcessos) {
    let tempoCorrente = 0;

    let listaDeRetangulos = [];

    listaDeProcessos.sort(function (a, b) {
        if (a.tempoDeChegada > b.tempoDeChegada) { return 1; }
        if (a.tempoDeChegada < b.tempoDeChegada) { return -1; }
        return 0;
    });

    if(listaDeProcessos[0].tempoDeChegada > tempoCorrente){
        tempoCorrente += listaDeProcessos[0].tempoDeChegada;
    }
    listaDeProcessos.forEach((processo) => {
        if (processo.tempoDeChegada <= tempoCorrente) {
            let retangulo = {
                id: processo.id,
                tempoInicial: tempoCorrente,
                tempoFinal: 0
            }
            tempoCorrente += processo.tempoDeExecucao;
            processo.turnAround = tempoCorrente - processo.tempoDeChegada;
            processo.tempoDeEspera = processo.turnAround - processo.tempoDeChegada;
            retangulo.tempoFinal = tempoCorrente;
            listaDeRetangulos.push(retangulo)
        }
        else {
            tempoCorrente += processo.tempoDeChegada - tempoCorrente;
            let retangulo = {
                id: processo.id,
                tempoInicial: tempoCorrente,
                tempoFinal: 0
            }
            tempoCorrente += processo.tempoDeExecucao;
            processo.turnAround = tempoCorrente - processo.tempoDeChegada;
            processo.tempoDeEspera = processo.turnAround - processo.tempoDeChegada;

            retangulo.tempoFinal = tempoCorrente;
            listaDeRetangulos.push(retangulo)
        }
    })
    return listaDeRetangulos;
}

function findTurnAroundTime(listaDeProcessos) {
    listaDeProcessosFIFO(listaDeProcessos);

    let total = 0;
    listaDeProcessos.forEach((processo) => {
        total += processo.turnAround;
    })
    return (total / listaDeProcessos.length);
}

export { listaDeProcessosFIFO, findTurnAroundTime }
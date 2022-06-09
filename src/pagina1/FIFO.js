// Test Setup
import { Processo } from "./Processo.js";
import { Retangulo } from "./Retangulo.js";

function listaDeProcessosFIFO(listaDeProcessos) {
    let tempoCorrente = 0;

    let mudancaa = 0;

    let listaDeRetangulos = [];

    listaDeProcessos.sort(function(a, b) {
        if (a.tempoDeChegada > b.tempoDeChegada) { return 1; }
        if (a.tempoDeChegada < b.tempoDeChegada) { return -1; }
        return 0;
    });

    if (listaDeProcessos[0].tempoDeChegada > tempoCorrente) {
        tempoCorrente += listaDeProcessos[0].tempoDeChegada;
    }
    listaDeProcessos.forEach((processo) => {
        if (processo.tempoDeChegada <= tempoCorrente) {
            let retangulo = new Retangulo(processo.id, tempoCorrente);
            tempoCorrente += processo.tempoDeExecucao;
            processo.turnAround = tempoCorrente - processo.tempoDeChegada;
            processo.tempoDeEspera = processo.turnAround - processo.tempoDeExecucao;
            retangulo.tempoFinal = tempoCorrente;
            listaDeRetangulos.push(retangulo)
        } else {
            tempoCorrente += processo.tempoDeChegada - tempoCorrente;
            let retangulo = new Retangulo(processo.id, tempoCorrente);
            tempoCorrente += processo.tempoDeExecucao;
            processo.turnAround = tempoCorrente - processo.tempoDeChegada;
            processo.tempoDeEspera = processo.turnAround - processo.tempoDeExecucao;

            retangulo.tempoFinal = tempoCorrente;
            listaDeRetangulos.push(retangulo)
        }
    })
    return listaDeRetangulos;
} //mudanca

function findTurnAroundTime(listaDeProcessos) {
    let listaDeRetangulos = listaDeProcessosFIFO(listaDeProcessos);

    let total = 0;
    let totalWT = 0;
    listaDeProcessos.forEach((processo) => {
        total += processo.turnAround;
        totalWT += processo.tempoDeEspera;
    })

    let retorno = {
        listaDeRetangulos: listaDeRetangulos,
        Tat: (total / listaDeProcessos.length),
        Wt: (totalWT / listaDeProcessos.length)
    }

    return retorno;
}

function main() {
    let n = 3;

    var teste = new Processo(1, 0, 4);
    var teste2 = new Processo(2, 2, 6);
    var teste3 = new Processo(3, 4, 7);

    var listaDeProcessos = new Array(n).fill(0);
    listaDeProcessos[0] = teste;
    listaDeProcessos[1] = teste2;
    listaDeProcessos[2] = teste3;

    let retorno = findTurnAroundTime(listaDeProcessos);
    console.log("Lista de retângulos:")
    console.log(retorno.listaDeRetangulos)
    console.log("TAT:")
    console.log(retorno.Tat);
    console.log("WT:")
    console.log(retorno.Wt);
}

main();

export { listaDeProcessosFIFO, findTurnAroundTime }
// Test Setup
import { Processo } from "./Processo.js";
import { Retangulo } from "./Retangulo.js";

function listaDeProcessosFIFO(listaDeProcessos, memoria) {
    let tempoCorrente = 0;

    let listaDeRetangulos = [];

    listaDeProcessos.sort(function (a, b) {
        if (a.tempoDeChegada > b.tempoDeChegada) { return 1; }
        if (a.tempoDeChegada < b.tempoDeChegada) { return -1; }
        return 0;
    });

    if (listaDeProcessos[0].tempoDeChegada > tempoCorrente) {
        tempoCorrente += listaDeProcessos[0].tempoDeChegada;
    }
    listaDeProcessos.forEach((processo) => {
        if (processo.tempoDeChegada <= tempoCorrente) {
            preenchePaginasNaMemoria(processo, memoria);
            let matrix = stringMatrix(memoria);
            let retangulo = new Retangulo(processo.id, tempoCorrente, -1, -1, false, -1, true, matrix);
            tempoCorrente += processo.tempoDeExecucao;
            processo.turnAround = tempoCorrente - processo.tempoDeChegada;
            processo.tempoDeEspera = processo.turnAround - processo.tempoDeExecucao;
            retangulo.tempoFinal = tempoCorrente;
            listaDeRetangulos.push(retangulo)
            removePaginasDaMemoria(processo, memoria);
        } else {
            tempoCorrente += processo.tempoDeChegada - tempoCorrente;
            preenchePaginasNaMemoria(processo, memoria);
            let matrix = stringMatrix(memoria);
            let retangulo = new Retangulo(processo.id, tempoCorrente, -1, -1, false, -1, true, matrix);
            tempoCorrente += processo.tempoDeExecucao;
            processo.turnAround = tempoCorrente - processo.tempoDeChegada;
            processo.tempoDeEspera = processo.turnAround - processo.tempoDeExecucao;
            retangulo.tempoFinal = tempoCorrente;
            listaDeRetangulos.push(retangulo)
            removePaginasDaMemoria(processo, memoria);
        }
    })
    return listaDeRetangulos;
}

function findTurnAroundTime(listaDeProcessos) {
    let matrix = new Array(10);
    for(let i = 0 ; i < 10 ; i++){
        matrix[i] = new Array(5).fill('-1');
    }
    let memoria = {
        matrixMemoria: matrix,
        espacosVazios: 50
    }

    let listaDeRetangulos = listaDeProcessosFIFO(listaDeProcessos, memoria);

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

function preenchePaginasNaMemoria(processo, memoria) {
    //Caso exista posições suficientes para todas as páginas
    if (memoria.espacosVazios >= processo.paginas.length) {
        let count = 0; //Controle para a página atual
        for (let i = 0; i < 10; i++) { //Percorre as 10 linhas
            for (let j = 0; j < 5; j++) { //Percorre as 5 colunas
                if (memoria.matrixMemoria[i][j] == -1) { //Se a poisção estiver livre
                    memoria.matrixMemoria[i][j] = processo.paginas[count]; //Guarda o valor da página
                    let posicao = { //Objeto com a posição da página na matrix
                        i: i,
                        j: j
                    }
                    processo.posicoesPaginas[count] = posicao; //Guarda a posição no processo
                    count++; //Passa pra próxima página
                    memoria.espacosVazios--; //Diminui em 1 o número de espaços livres
                    if (count == processo.paginas.length) //Se todas as páginas foram guardadas
                        return true;
                }
            }
        }
    }
    return false;
}

function removePaginasDaMemoria(processo, memoria) {
    for(let count=0 ; count < processo.paginas.length ; count++){
        let i = processo.posicoesPaginas[count].i;
        let j = processo.posicoesPaginas[count].j;
        memoria.matrixMemoria[i][j] = '-1';
        memoria.espacosVazios++;
        processo.posicoesPaginas[count] = '-1';
    }
}

function stringMatrix(memoria) {
    let matrix = "";
    for (let i = 0; i < 10; i++) { //Percorre as 10 linhas
        for (let j = 0; j < 5; j++) { //Percorre as 5 colunas
            if(memoria.matrixMemoria){
                if(memoria.matrixMemoria[i][j] != "-1")
                    matrix += "\xa0"
                matrix += ("\xa0" + memoria.matrixMemoria[i][j] + " ");
            }
        }
        matrix += "\n";
    }
    return matrix;
}

function main() {
    let n = 3;

    var teste = new Processo(1, 0, 4, 0, "123456789102230230");
    var teste2 = new Processo(2, 2, 6, 0, "12345");
    var teste3 = new Processo(3, 4, 7, 0, "987654");

    var listaDeProcessos = new Array(n).fill(0);
    listaDeProcessos[0] = teste;
    listaDeProcessos[1] = teste2;
    listaDeProcessos[2] = teste3;

    let retorno = findTurnAroundTime(listaDeProcessos);
    //console.log("Lista de retângulos:")
    //console.log(retorno.listaDeRetangulos)
    console.log("Retângulo " + retorno.listaDeRetangulos[0].id)
    console.log(retorno.listaDeRetangulos[0].matrix)
    console.log("Retângulo " + retorno.listaDeRetangulos[1].id)
    console.log(retorno.listaDeRetangulos[1].matrix)
    console.log("Retângulo " + retorno.listaDeRetangulos[2].id)
    console.log(retorno.listaDeRetangulos[2].matrix)
    console.log("TAT:")
    console.log(retorno.Tat);
    console.log("WT:")
    console.log(retorno.Wt);
    
    //let matrix = new Array(10);
    //for(let i = 0 ; i < 10 ; i++){
    //    matrix[i] = new Array(5).fill('-1');
    //}
    //let memoria = {
    //    matrixMemoria: matrix,
    //    espacosVazios: 50
    //}
    //console.log(preenchePaginasNaMemoria(listaDeProcessos[0], memoria));
    //console.log(memoria.matrixMemoria)
    //console.log(memoria.espacosVazios)
    //console.log(listaDeProcessos[0].posicoesPaginas)
    //console.log(stringMatrix(memoria))

    //removePaginasDaMemoria(listaDeProcessos[0], memoria);
    //console.log(memoria.matrixMemoria)
    //console.log(memoria.espacosVazios)
    //console.log(stringMatrix(memoria))
    
}

main();

export { findTurnAroundTime }
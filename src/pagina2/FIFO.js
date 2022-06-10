// Test Setup
import { Processo } from "./Processo.js";
import { Retangulo } from "./Retangulo.js";
import { FIFO } from "./FIFOPaginacao.js";

function listaDeProcessosFIFO(listaDeProcessos, controle) {
    let tempoCorrente = 0;

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
            //Entra na memória virtual
            //Caso a memória virtual esteja cheia, o processo é ignorado
            let index = temEspacoNoDisco(controle.vetorDisco);
            if (index != -1) //tem espaço no disco
                controle.vetorDisco[index] = processo.id;
            else
                return listaDeRetangulos;

            //Trata a matriz de memória ram
            preenchePaginasNaMemoria(processo, controle);

            let retangulo = new Retangulo(processo.id, tempoCorrente, false, -1, false, -1, true);

            tempoCorrente += processo.tempoDeExecucao;
            processo.turnAround = tempoCorrente - processo.tempoDeChegada;
            processo.tempoDeEspera = processo.turnAround - processo.tempoDeExecucao;
            retangulo.tempoFinal = tempoCorrente;

            let matrixMemoria = stringMatrix(controle);
            let matrixDisco = stringDisco(controle);
            let matrixPaginas = stringTabelaPaginas(controle);

            retangulo.matrixMemoria = matrixMemoria;
            retangulo.matrixDisco = matrixDisco;
            retangulo.matrixPaginas = matrixPaginas;

            listaDeRetangulos.push(retangulo)

            //Trata a matriz de memória ram
            removePaginasDaMemoria(processo, controle);
        } else {
            tempoCorrente += processo.tempoDeChegada - tempoCorrente;

            preenchePaginasNaMemoria(processo, controle);

            let retangulo = new Retangulo(processo.id, tempoCorrente, false, -1, false, -1, true);

            tempoCorrente += processo.tempoDeExecucao;
            processo.turnAround = tempoCorrente - processo.tempoDeChegada;
            processo.tempoDeEspera = processo.turnAround - processo.tempoDeExecucao;
            retangulo.tempoFinal = tempoCorrente;

            let matrixMemoria = stringMatrix(controle);
            let matrixDisco = stringDisco(controle);
            let matrixPaginas = stringTabelaPaginas(controle);

            retangulo.matrixMemoria = matrixMemoria;
            retangulo.matrixDisco = matrixDisco;
            retangulo.matrixPaginas = matrixPaginas;

            listaDeRetangulos.push(retangulo)

            removePaginasDaMemoria(processo, controle);
        }
    })
    return listaDeRetangulos;
}

function findTurnAroundTimeFIFO(listaDeProcessos) {
    //Matriz de memória RAM
    //Quando um processo estiver no disco, 
    let matrix = new Array(10);
    for (let i = 0; i < 10; i++) {
        matrix[i] = new Array(5).fill(-1);
    }
    let controle = {
        matrixMemoria: matrix,
        espacosVaziosMatrixMemoria: 50,
        //Vetor de disco (memória virtual) - capacidade de 12 processos
        //Quando um processo chega, ele entra no disco
        vetorDisco: new Array(12).fill(-1),
        //Vetor auxiliar (tabela) de páginas com 10 posições
        //Quando é a vez dele de executar, testa se as páginas estão no vetor
        paginas: []
    }

    let listaDeRetangulos = listaDeProcessosFIFO(listaDeProcessos, controle);

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

    printResultados(listaDeRetangulos);

    return retorno;
}

function preenchePaginasNaMemoria(processo, controle) {
    //Caso exista posições suficientes para todas as páginas
    if (controle.espacosVaziosMatrixMemoria >= processo.paginas.length) {
        trataPaginas(processo, controle);
        let count = 0; //Controle para a página atual
        for (let i = 0; i < 10; i++) { //Percorre as 10 linhas
            for (let j = 0; j < 5; j++) { //Percorre as 5 colunas
                if (controle.matrixMemoria[i][j] == -1) { //Se a poisção estiver livre
                    let pagina = {
                        valor: processo.paginas[count],
                        processo: processo.id
                    }
                    controle.matrixMemoria[i][j] = pagina; //Guarda o valor da página
                    let posicao = { //Objeto com a posição da página na matrix
                        i: i,
                        j: j
                    }
                    processo.posicoesPaginas[count] = posicao; //Guarda a posição no processo
                    count++; //Passa pra próxima página
                    controle.espacosVaziosMatrixMemoria--; //Diminui em 1 o número de espaços livres
                    if (count == processo.paginas.length) { //Se todas as páginas foram guardadas
                        return true;
                    }
                }
            }
        }
    }
    return false;
}

function trataPaginas(processo, controle) {
    let paginasParaTroca = [];
    let qtdDePaginas = processo.paginas.length;
    for (let i = 0; i < qtdDePaginas; i++) {
        if (!controle.paginas.includes(processo.paginas[i])) {
            if (controle.paginas.length == 10)
                paginasParaTroca.push(processo.paginas[i]);
            else if (controle.paginas.length < 10)
                controle.paginas.unshift(processo.paginas[i]);
        } else
            paginasParaTroca.push(processo.paginas[i]);
    }
    if (paginasParaTroca.length > 0) {
        for (let i = 0; i < paginasParaTroca.length; i++) {
            FIFO(controle.paginas, paginasParaTroca[i], 10);
        }
    }
}

function removePaginasDaMemoria(processo, controle) {
    for (let count = 0; count < processo.paginas.length; count++) {
        let i = processo.posicoesPaginas[count].i;
        let j = processo.posicoesPaginas[count].j;
        controle.matrixMemoria[i][j] = -1;
        controle.espacosVaziosMatrixMemoria++;
        processo.posicoesPaginas[count] = -1;
    }
}

function stringMatrix(controle) {
    let matrix = "\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0";
    for (let i = 0; i < 10; i++) { //Percorre as 10 linhas
        matrix += "\xa0\xa0\xa0"
        for (let j = 0; j < 5; j++) { //Percorre as 5 colunas
            if (controle.matrixMemoria) {
                if (controle.matrixMemoria[i][j] == -1) {
                    matrix += ("\xa0- ");
                } else
                    matrix += ("\xa0" + controle.matrixMemoria[i][j].processo + " ");
            }
        }
        matrix += "\n\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0";
    }
    return matrix;
}

function stringDisco(controle) {
    let vetor = "\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0";
    let count = 0;
    for (let i = 0; i < 12; i++) {
        count++;
        if (controle.vetorDisco) {
            if (controle.vetorDisco[i] == -1) {
                vetor += ("\xa0- ");
            } else
                vetor += ("\xa0" + controle.vetorDisco[i] + " ");
            if (count % 3 == 0)
                vetor += "\n\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0";
        }
    }
    return vetor;
}

function stringTabelaPaginas(controle) {
    let vetor = "\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0";
    let count = 0;
    for (let i = 0; i < controle.paginas.length; i++) {
        count++;
        if (controle.paginas) {
            vetor += ("\xa0" + controle.paginas[i] + " ");
            if (count % 5 == 0)
                vetor += "\n\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0";
        }
    }
    if (controle.paginas.length < 10) {
        for (let i = 0; i < (10 - controle.paginas.length); i++) {
            count++;
            if (controle.paginas) {
                vetor += ("\xa0- ");
                if (count % 5 == 0)
                    vetor += "\n\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0";
            }
        }
    }

    return vetor;
}

function printResultados(listaDeRetangulos) {
    for (let i = 0; i < listaDeRetangulos.length; i++) {
        console.log("\n\n\n\n================== Tempo Atual: " + listaDeRetangulos[i].tempoInicial + " ==================\n")
        console.log(listaDeRetangulos[i].matrixMemoria)
        console.log("======================= Disco =======================\n")
        console.log(listaDeRetangulos[i].matrixDisco)
        console.log("====================== Páginas ======================\n")
        console.log(listaDeRetangulos[i].matrixPaginas)

        console.log("===================== Retangulo =====================\n")
        console.log("\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0Tempo Inicial: " + listaDeRetangulos[i].tempoInicial)
        console.log("\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0Tempo Final: " + listaDeRetangulos[i].tempoFinal)
        console.log("\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0ID Processo: " + listaDeRetangulos[i].id)
    }
}

function temEspacoNoDisco(vetorDisco) {
    for (let i = 0; i < vetorDisco.length; i++) {
        if (vetorDisco[i] == -1)
            return i;
    }
    return -1;
}

function main() {
    let n = 3;

    var teste = new Processo(1, 0, 4, 0, "ABCD");
    var teste2 = new Processo(2, 2, 6, 0, "MFJD");
    var teste3 = new Processo(3, 4, 7, 0, "ÇVCX976");

    var listaDeProcessos = new Array(n).fill(0);
    listaDeProcessos[0] = teste;
    listaDeProcessos[1] = teste2;
    listaDeProcessos[2] = teste3;

    let retorno = findTurnAroundTimeFIFO(listaDeProcessos);

    /*retorno.listaDeRetangulos.forEach((retangulo) => {
        console.log("Memória RAM com o processo " + retangulo.id)
        console.log(retangulo.matrix)
    })
    //console.log("Lista de retângulos:")
    //console.log(retorno.listaDeRetangulos)
    console.log("TAT:")
    console.log(retorno.Tat);
    console.log("WT:")
    console.log(retorno.Wt);*/
}

main();

export { findTurnAroundTimeFIFO }
// Test Setup
import { Processo } from "./Processo.js";
import { Retangulo } from "./Retangulo.js";
import { FIFO } from "./FIFOPaginacao.js";

// Função que executa o SJF, fazendo o controle do disco, memória e páginas.
const findWaitingTime = (listaDeProcessos, controle) => {
    let quantidadeDeProcessos = listaDeProcessos.length;
    let tempoCorrente = 0; // Current time
    let vetorPrincipal = []; //Inicia vetor principal (PRECISA ESTAR AQUI)
    let listaDeRetangulos = [];

    //Vetor para ordenar pelo tempo de chegada
    let vetorCopiaProcessos = new Array(quantidadeDeProcessos).fill(0); //Faz uma cópia dos processos
    for (let i = 0; i < quantidadeDeProcessos; i++)
        vetorCopiaProcessos[i] = listaDeProcessos[i];
    vetorCopiaProcessos.sort(function(a, b) { //Ordenando pela ordem de chegada de cada processo
        if (a.tempoDeChegada > b.tempoDeChegada) {
            return 1;
        }
        if (a.tempoDeChegada < b.tempoDeChegada) {
            return -1;
        }
        return 0;
    });

    //Loop de execução
    while (1) {
        let vetorAuxiliar = []; //Vetor para ordenar pelo tempo de execução
        let retangulo = new Retangulo();

        for (let i = 0; i < quantidadeDeProcessos; i++) { //Pega os processos que podem ser executados e guarda no vetor auxiliar
            if (vetorCopiaProcessos[i] != 0 && vetorCopiaProcessos[i].tempoDeChegada <= tempoCorrente) {
                vetorAuxiliar.push(vetorCopiaProcessos[i]);
                vetorCopiaProcessos[i] = 0;
            }
        }
        vetorAuxiliar.sort(function(a, b) { //Ordena o vetor auxiliar pelo tempo de execução
            if (a.tempoDeExecucao > b.tempoDeExecucao) {
                return 1;
            }
            if (a.tempoDeExecucao < b.tempoDeExecucao) {
                return -1;
            }
            return 0;
        });

        //Adiciona os processos aptos na fila principal
        for (let i = 0; i < vetorAuxiliar.length; i++) {
            if (vetorPrincipal)
                vetorPrincipal.push(vetorAuxiliar[i]);
        }

        //Se existir processo na fila
        if (vetorPrincipal && vetorPrincipal.length > 0) {
            if (vetorPrincipal[0].tempoDeExecucaoAtual > 0) {
                //Entra no disco
                //Caso o disco esteja cheio, o processo é ignorado
                let index = temEspacoNoDisco(controle.vetorDisco);
                if (index != -1) //tem espaço no disco
                    controle.vetorDisco[index] = vetorPrincipal[0].id;
                else
                    priorityEndline[i].ignorar = true;

                preenchePaginasNaMemoria(vetorPrincipal[0], controle);

                let matrixMemoria = stringMatrix(controle);
                let matrixDisco = stringDisco(controle);
                let matrixPaginas = stringTabelaPaginas(controle);

                retangulo.matrixMemoria = matrixMemoria;
                retangulo.matrixDisco = matrixDisco;
                retangulo.matrixPaginas = matrixPaginas;

                retangulo.tempoInicial = tempoCorrente; // Define o tempo inicial do retangulo
                tempoCorrente += vetorPrincipal[0].tempoDeExecucao; // Adiciona um ciclo no tempo
                retangulo.id = vetorPrincipal[0].id; // Define o processo do retangulo
                retangulo.tempoFinal = tempoCorrente; // Define o tempo final do retangulo
                listaDeRetangulos.push(retangulo);

                //Define o tempo de espera do processo como o tempo atual menos o tempo de execução
                if (listaDeProcessos) {
                    for (let i = 0; i < quantidadeDeProcessos; i++) {
                        if (vetorPrincipal[0]) {
                            if (listaDeProcessos[i].id == vetorPrincipal[0].id) {
                                listaDeProcessos[i].tempoDeEspera = tempoCorrente - vetorPrincipal[0].tempoDeExecucao - listaDeProcessos[i].tempoDeChegada;
                            }
                        }
                    }
                }

                removePaginasDaMemoria(vetorPrincipal[0], controle);
                //Retira o processo executado da fila
                vetorPrincipal.shift();

                //Retira os elementos nulos do vetor
                if (vetorPrincipal) {
                    vetorPrincipal = vetorPrincipal.filter(function(el) {
                        return el != null;
                    });
                }
                //Se o vetor principal ficou vazio após a execução
                //E todos os processos na cópia estão como 0, finaliza o loop
                if (vetorPrincipal.length == 0) {
                    if (acabouExecucao(vetorCopiaProcessos, quantidadeDeProcessos)) {
                        return listaDeRetangulos;
                    }
                }
            }
        } else {
            tempoCorrente++;
        }
    }
}

//Função que faz o teste de parada para execução do SJF
function acabouExecucao(vetorCopiaProcessos, quantidadeDeProcessos) {
    var acabou = true;

    for (let i = 0; i < quantidadeDeProcessos; i++) {
        if (vetorCopiaProcessos[i] != 0) {
            acabou = false;
        }
    }

    return acabou;
}

// Função para calcular TAT de cada processo
const findTurnAroundTime = (listaDeProcessos, quantidadeDeProcessos) => {

    for (let i = 0; i < quantidadeDeProcessos; i++) {
        if (listaDeProcessos) {
            listaDeProcessos[i].turnAround = listaDeProcessos[i].tempoDeExecucao + listaDeProcessos[i].tempoDeEspera;
        }
    }
}

// Função principal que retorna os resultados para o Front
const findavgTimeSJF = (listaDeProcessos) => {
    let total_wt = 0,
        total_tat = 0;
    let quantidadeDeProcessos = listaDeProcessos.length;

    let matrix = new Array(10);
    for (let i = 0; i < 10; i++) {
        matrix[i] = new Array(5).fill(-1);
    }
    let controle = {
        matrixMemoria: matrix,
        espacosVaziosMatrixMemoria: 50,
        //Vetor de disco (memória virtual) - capacidade de 10 processos
        //Quando um processo chega, ele entra no disco
        vetorDisco: new Array(10).fill(-1),
        //Vetor auxiliar (tabela) de páginas com 10 posições
        //Quando é a vez dele de executar, testa se as páginas estão no vetor
        paginas: [] //sempre se adiciona com unshift
    }

    // Função para encontrar o tempo de espera de todos os processos
    let listaDeRetangulos = findWaitingTime(listaDeProcessos, controle);

    // Função para encontrar o TAT de todos os processos
    findTurnAroundTime(listaDeProcessos, quantidadeDeProcessos);

    // Calcula o tempo total de espera e o TAT total 
    for (let i = 0; i < quantidadeDeProcessos; i++) {
        if (listaDeProcessos) {
            total_wt = total_wt + listaDeProcessos[i].tempoDeEspera;
            total_tat = total_tat + listaDeProcessos[i].turnAround;
        }
    }

    let retorno = {
        listaDeRetangulos: listaDeRetangulos,
        Wt: (total_wt / quantidadeDeProcessos),
        Tat: (total_tat / quantidadeDeProcessos)
    }

    printResultados(listaDeRetangulos);

    return retorno;
}

//Função que trata e altera a matriz de memória
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
                    if (count == processo.paginas.length) //Se todas as páginas foram guardadas
                        return true;
                }
            }
        }
    }
    return false;
}

//Função que trata o vetor de páginas e chama o algoritmo de troca (FIFO)
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

//Função que remove as páginas da matrix que não estão no vetor de páginas
function removePaginasDaMemoria(processo, controle) {
    let quantidadeDePaginas = processo.paginas.length;
    for (let count = 0; count < quantidadeDePaginas; count++) {
        let i = processo.posicoesPaginas[count].i;
        let j = processo.posicoesPaginas[count].j;
        controle.matrixMemoria[i][j] = -1;
        controle.espacosVaziosMatrixMemoria++;
        processo.posicoesPaginas[count] = -1;
    }
}

//Gera a string com a matrix da memória
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

//Gera a string com a matrix do disco
function stringDisco(controle) {
    let vetor = "\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0";
    let count = 0;
    for (let i = 0; i < 10; i++) {
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

//Gera a string com a matrix de páginas
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

//Faz o print no console dos valores principais
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

//Testa se existe espaço no disco
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
    var teste2 = new Processo(2, 2, 6, 0, "MDFJ");
    var teste3 = new Processo(3, 4, 7, 0, "ÇVCX976");

    var listaDeProcessos = new Array(n).fill(0);
    listaDeProcessos[0] = teste;
    listaDeProcessos[1] = teste2;
    listaDeProcessos[2] = teste3;

    let retorno = findavgTimeSJF(listaDeProcessos);

    /* retorno.listaDeRetangulos.forEach((retangulo) => {
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

//main();

export { findavgTimeSJF }
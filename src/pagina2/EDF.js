import { Processo } from "./Processo.js";
import { Retangulo } from "./Retangulo.js";
import { LRU } from "./LRUPaginacao.js";
/*
 * Para cada volta do looping, ordenamos o vetor de processos e testamos.
 * Se existir 1 processo com o tempo tempo de chegada >= tempo atual, adiciona ao vetor.
 * Se existir mais de 1 processo com o tempo de chegada >= tempo atual,
 * ordena pelo deadline e adiciona no vetor principal.
 */

// Função que calcula o tempo de espera de cada processo
const findWaitingTime = (listaDeProcessos, quantum, overload, controle) => {
    let quantidadeDeProcessos = listaDeProcessos.length;
    let tempoCorrente = 0; // Current time
    let vetorPrincipal = []; //Inicia vetor principal (PRECISA ESTAR AQUI)
    let vetorAuxiliar; //Vetor para ordenar pelo deadline
    let vetorCopiaProcessos; //Vetor para ordenar pelo tempo de chegada
    let listaDeRetangulos = [];

    vetorCopiaProcessos = new Array(quantidadeDeProcessos).fill(0); //Faz uma cópia dos processos
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
        vetorAuxiliar = [];

        let retangulo = new Retangulo();

        for (let i = 0; i < quantidadeDeProcessos; i++) { //Pega os processos que podem ser executados e guarda no vetor auxiliar
            if (vetorCopiaProcessos[i] != 0 && vetorCopiaProcessos[i].tempoDeChegada <= tempoCorrente) {
                vetorAuxiliar.push(vetorCopiaProcessos[i]);
                vetorCopiaProcessos[i] = 0;
            }
        }
        vetorAuxiliar.sort(function(a, b) { //Ordena o vetor auxiliar pelo deadline
            if (a.deadline > b.deadline) {
                return 1;
            }
            if (a.deadline < b.deadline) {
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
                retangulo.id = vetorPrincipal[0].id;
                //Entra na memória virtual
                //Caso a memória virtual esteja cheia, o processo é ignorado
                let index = temEspacoNoDisco(controle.vetorDisco);
                let control = false;
                if (index != -1) { //tem espaço no disco
                    for (let i = 0; i < controle.vetorDisco.length; i++) {
                        if (controle.vetorDisco[i] == vetorPrincipal[0].id) {
                            control = true;
                        }
                    }
                    if (!control) {
                        controle.vetorDisco[index] = vetorPrincipal[0].id;
                    }
                } else
                    return listaDeRetangulos;

                //Se o tempo de execução restante for maior que o quantum
                if (vetorPrincipal[0].tempoDeExecucaoAtual > quantum) {
                    if (vetorPrincipal[0].tempoDeExecucao == vetorPrincipal[0].tempoDeExecucaoAtual) {
                        preenchePaginasNaMemoria(vetorPrincipal[0], controle);
                    }

                    let retanguloSobrecarga = new Retangulo(vetorPrincipal[0].id, 0, true);

                    retangulo.tempoInicial = tempoCorrente;
                    // Aumenta o valor de t, ou seja, mostra quanto tempo um processo foi processado
                    tempoCorrente += quantum;
                    // Defini tempo inicial do retangulo de sobrecarga
                    retanguloSobrecarga.tempoInicial = tempoCorrente;
                    // Defini tempo final do retangulo do processo atual 
                    retangulo.tempoFinal = tempoCorrente;
                    // Adcionando tempo de sobrecarga
                    tempoCorrente += overload;

                    // Defini tempo final do retangulo de sobrecarga
                    retanguloSobrecarga.tempoFinal = tempoCorrente;

                    // Diminui do tempo de execução restante o valor do quantum
                    vetorPrincipal[0].tempoDeExecucaoAtual -= quantum;

                    let matrixMemoria = stringMatrix(controle);
                    let matrixDisco = stringDisco(controle);
                    let matrixPaginas = stringTabelaPaginas(controle);

                    retangulo.matrixMemoria = matrixMemoria;
                    retangulo.matrixDisco = matrixDisco;
                    retangulo.matrixPaginas = matrixPaginas;

                    retanguloSobrecarga.matrixMemoria = matrixMemoria;
                    retanguloSobrecarga.matrixDisco = matrixDisco;
                    retanguloSobrecarga.matrixPaginas = matrixPaginas;


                    // Adiciona o retangulo do processo atual e do de sobrecarga
                    listaDeRetangulos.push(retangulo);
                    listaDeRetangulos.push(retanguloSobrecarga);

                }

                //Se o tempo de execução restante for menor ou igual ao quantum
                //o último quantum desse processo será executado
                else {
                    if (vetorPrincipal[0].tempoDeExecucao == vetorPrincipal[0].tempoDeExecucaoAtual) {
                        preenchePaginasNaMemoria(vetorPrincipal[0], controle);
                    }

                    let matrixMemoria = stringMatrix(controle);
                    let matrixDisco = stringDisco(controle);
                    let matrixPaginas = stringTabelaPaginas(controle);

                    retangulo.matrixMemoria = matrixMemoria;
                    retangulo.matrixDisco = matrixDisco;
                    retangulo.matrixPaginas = matrixPaginas;

                    retangulo.tempoInicial = tempoCorrente;

                    //Aumenta o valor do tempo pelo tempo de execução que falta no processo
                    tempoCorrente = tempoCorrente + vetorPrincipal[0].tempoDeExecucaoAtual;

                    retangulo.tempoFinal = tempoCorrente;
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

                    //O processo foi totalmente executado, então seu tempo de execução restante é 0
                    vetorPrincipal[0].tempoDeExecucaoAtual = 0;

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
                    //TODO if todos os elementos da cópia são iguais a zero
                    if (vetorPrincipal.length == 0) {
                        if (acabouProcesso(vetorCopiaProcessos, quantidadeDeProcessos)) {
                            break;
                        }
                    }
                }
            }
        } else {
            tempoCorrente++;
        }
    }
    return listaDeRetangulos;
}

//Condição de parada
function acabouProcesso(vetorCopiaProcessos, quantidadeDeProcessos) {
    var acabou = true;

    for (let i = 0; i < quantidadeDeProcessos; i++) {
        if (vetorCopiaProcessos[i] != 0) {
            acabou = false;
        }
    }

    return acabou;
}

// Função para calcular TAT 
const findTurnAroundTime = (listaDeProcessos, quantidadeDeProcessos) => {
    for (let i = 0; i < quantidadeDeProcessos; i++) {
        if (listaDeProcessos) {
            listaDeProcessos[i].turnAround = listaDeProcessos[i].tempoDeExecucao + listaDeProcessos[i].tempoDeEspera;
        }
    }
}

// Função para fazer o teste de estouro de deadline e retornar os retangulos com deadline
const deadlineOverFlow = (listaDeRetangulos, listaDeProcessos) => {
    let quantidadeDeProcessos = listaDeProcessos.length;

    for (let i = 0; i < quantidadeDeProcessos; i++) {
        if (listaDeProcessos) {
            //console.log("TurnAroud " + listaDeProcessos[i].turnAround + " DeadLine " + listaDeProcessos[i].deadline)
            if (listaDeProcessos[i].turnAround > (listaDeProcessos[i].deadline - listaDeProcessos[i].tempoDeChegada))
            {
                //console.log("Entrou")
                listaDeProcessos[i].deadlineEstaEstourado = true;
            }
        }
    }

    listaDeRetangulos.forEach((retangulo) => {
        let processoAtual = listaDeProcessos.find(element => element.id == retangulo.id);
        if (processoAtual) {
            if (processoAtual.deadlineEstaEstourado) {
                retangulo.deadline = processoAtual.deadline;
            }
        }
    })

    let listaDeRetangulosFinal = [] //Faz uma cópia dos retangulos
    let listaDeRetangulosInvertida = new Array(listaDeRetangulos.length).fill(0); //Faz uma cópia dos retangulos
    for (let i = 0; i < listaDeRetangulos.length; i++) //Inverte a cópia da lista de retangulos
        listaDeRetangulosInvertida[i] = listaDeRetangulos[i];
    listaDeRetangulosInvertida.sort(function(a, b) {
        if (a.tempoFinal < b.tempoFinal) {
            return 1;
        }
        if (a.tempoFinal > b.tempoFinal) {
            return -1;
        }
        return 0;
    });

    listaDeRetangulos.forEach((retangulo) => {
        if (retangulo.deadline > -1) {
            //Deadline divide o retangulo
            if ((retangulo.tempoFinal >= retangulo.deadline) && (retangulo.tempoInicial < retangulo.deadline)) {
                let retangulo1 = new Retangulo(retangulo.id, retangulo.tempoInicial, false, retangulo.deadline, false, retangulo.deadline);
                retangulo1.matrixMemoria = retangulo.matrixMemoria;
                retangulo1.matrixDisco = retangulo.matrixDisco;
                retangulo1.matrixPaginas = retangulo.matrixPaginas;
                let retangulo2 = new Retangulo(retangulo.id, retangulo.deadline, false, retangulo.tempoFinal, true, retangulo.deadline);
                retangulo2.matrixMemoria = retangulo.matrixMemoria;
                retangulo2.matrixDisco = retangulo.matrixDisco;
                retangulo2.matrixPaginas = retangulo.matrixPaginas;
                if (retangulo1.tempoInicial != retangulo1.tempoFinal)
                    listaDeRetangulosFinal.push(retangulo1);
                if (retangulo2.tempoInicial != retangulo2.tempoFinal)
                    listaDeRetangulosFinal.push(retangulo2);
            } else if (retangulo.tempoInicial >= retangulo.deadline) {
                retangulo.deadlineBool = true;
                listaDeRetangulosFinal.push(retangulo);
            } else {
                retangulo.deadlineBool = false;
                listaDeRetangulosFinal.push(retangulo);
            }
        } else
            listaDeRetangulosFinal.push(retangulo);
    })
    return listaDeRetangulosFinal;
}

// Função para calcular o tempo médio
const findavgTimeEDF = (listaDeProcessos, quantum = 0, over = 0) => {
   //console.log(listaDeProcessos)
    let quantidadeDeProcessos = listaDeProcessos.length;
    let total_wt = 0,
        total_tat = 0;

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
    let listaDeRetangulos = findWaitingTime(listaDeProcessos, quantum, over, controle);

    // Função para encontrar o TAT de todos os processos
    findTurnAroundTime(listaDeProcessos, quantidadeDeProcessos);

    let listaDeRetangulosFinal = deadlineOverFlow(listaDeRetangulos, listaDeProcessos);

    // Calcula o tempo total de espera e o TAT total 
    for (let i = 0; i < quantidadeDeProcessos; i++) {
        if (listaDeProcessos) {
            total_wt = total_wt + listaDeProcessos[i].tempoDeEspera;
            total_tat = total_tat + listaDeProcessos[i].turnAround;
        }
    }

    let retorno = {
        listaDeRetangulos: listaDeRetangulosFinal,
        Wt: (total_wt / quantidadeDeProcessos),
        Tat: (total_tat / quantidadeDeProcessos)
    }

    printResultados(retorno.listaDeRetangulos);

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
                    if (count == processo.paginas.length) //Se todas as páginas foram guardadas
                        return true;
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
    //console.log(controle.paginas)
    if (paginasParaTroca.length > 0) {
        for (let i = 0; i < paginasParaTroca.length; i++) {
            LRU(controle.paginas, paginasParaTroca[i], 10);
            //console.log(controle.paginas)
        }
    }
}

function removePaginasDaMemoria(processo, controle) {
    //console.log(controle.matrixMemoria)
    for (let count = 0; count < processo.paginas.length; count++) {
        let i = processo.posicoesPaginas[count].i;
        let j = processo.posicoesPaginas[count].j;
       // console.log(processo)
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
        console.log("\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0Sobrecarga? " + listaDeRetangulos[i].sobrecarga)
        console.log("\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0Deadline? " + listaDeRetangulos[i].deadlineBool)

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
    let n = 4;

    let quantum = 2;
    let over = 1;

    var teste = new Processo(1, 11, 5, 6, "ABCD");
    var teste2 = new Processo(2, 12, 4, 5, "MFJD");
    var teste3 = new Processo(3, 8, 2, 3, "ÇVCX");
    var teste4 = new Processo(4, 3, 4, 6, "HIJK");

    var listaDeProcessos = new Array(n).fill(0);
    listaDeProcessos[0] = teste;
    listaDeProcessos[1] = teste2;
    listaDeProcessos[2] = teste3;
    listaDeProcessos[3] = teste4;

    let retorno = findavgTimeEDF(listaDeProcessos, quantum, over);

    //console.log(retorno.listaDeRetangulos)



    //console.log("Lista de retângulos:")
    //console.log(retorno.listaDeRetangulos)
    //console.log("TAT:")
    //console.log(retorno.Tat);
    //console.log("WT:")
    //console.log(retorno.Wt);
}

main();

export { findavgTimeEDF }
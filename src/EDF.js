import { Processo } from "./Processo.js";
/*
 * Para cada volta do looping, ordenamos o vetor de processos e testamos.
 * Se existir 1 processo com o tempo tempo de chegada >= tempo atual, adiciona ao vetor.
 * Se existir mais de 1 processo com o tempo de chegada >= tempo atual,
 * ordena pelo deadline e adiciona no vetor principal.
 */

// Função que calcula o tempo de espera de cada processo
const findWaitingTime = (listaDeProcessos, quantum, overload) => {
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

        let retangulo = {
            id: 0,
            tempoInicial: 0,
            tempoFinal: 0,
            sobrecarga: false,
            isDeadline: false,
            deadline: -1
        }

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
                //Se o tempo de execução restante for maior que o quantum
                if (vetorPrincipal[0].tempoDeExecucaoAtual > quantum) {
                    var retanguloSobrecarga = { //retangulo para imprimir sobrecarga
                        id: -1,
                        tempoInicial: 0,
                        tempoFinal: 0,
                        sobrecarga: true
                    }

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

                    // Adiciona o retangulo do processo atual e do de sobrecarga
                    listaDeRetangulos.push(retangulo);
                    listaDeRetangulos.push(retanguloSobrecarga);
                }

                //Se o tempo de execução restante for menor ou igual ao quantum
                //o último quantum desse processo será executado
                else {
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
                                    listaDeProcessos[i].tempoDeEspera = tempoCorrente - vetorPrincipal[0].tempoDeExecucao - listaDeProcessos[i].tempoDeChegada;;
                                }
                            }
                        }
                    }

                    //O processo foi totalmente executado, então seu tempo de execução restante é 0
                    vetorPrincipal[0].tempoDeExecucaoAtual = 0;
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
            if (listaDeProcessos[i].turnAround > listaDeProcessos[i].deadline)
                listaDeProcessos[i].deadlineEstaEstourado = true;
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
                let retangulo1 = {
                    id: retangulo.id,
                    tempoInicial: retangulo.tempoInicial,
                    tempoFinal: retangulo.deadline,
                    isDeadline: false,
                    deadline: retangulo.deadline
                }
                let retangulo2 = {
                    id: retangulo.id,
                    tempoInicial: retangulo.deadline,
                    tempoFinal: retangulo.tempoFinal,
                    isDeadline: true,
                    deadline: retangulo.deadline
                }
                if (retangulo1.tempoInicial != retangulo1.tempoFinal)
                    listaDeRetangulosFinal.push(retangulo1);
                if (retangulo2.tempoInicial != retangulo2.tempoFinal)
                    listaDeRetangulosFinal.push(retangulo2);
            } else if (retangulo.tempoInicial >= retangulo.deadline) {
                retangulo.isDeadline = true;
                listaDeRetangulosFinal.push(retangulo);
            }
        } else
            listaDeRetangulosFinal.push(retangulo);
    })
    return listaDeRetangulosFinal;
}

// Função para calcular o tempo médio
const findavgTimeEDF = (listaDeProcessos, quantum, over) => {
    let quantidadeDeProcessos = listaDeProcessos.length;
    let total_wt = 0,
        total_tat = 0;

    // Função para encontrar o tempo de espera de todos os processos
    let listaDeRetangulos = findWaitingTime(listaDeProcessos, quantum, over);

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

    return retorno;
}

function main() {
    let n = 3;

    let quantum = 2;
    let over = 1;

    var teste = new Processo(1, 0, 4, 10);
    var teste2 = new Processo(2, 2, 6, 8);
    var teste3 = new Processo(3, 4, 7, 10);

    var listaDeProcessos = new Array(n).fill(0);
    listaDeProcessos[0] = teste;
    listaDeProcessos[1] = teste2;
    listaDeProcessos[2] = teste3;

    let retorno = findavgTimeEDF(listaDeProcessos, quantum, over);
    console.log("Lista de retângulos:")
    console.log(retorno.listaDeRetangulos)
    console.log("TAT:")
    console.log(retorno.Tat);
    console.log("WT:")
    console.log(retorno.Wt);
}

main();

export { findavgTimeEDF }
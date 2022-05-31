// Test Setup
import { Processo } from "./Processo.js";
import { Retangulo } from "./Retangulo.js";

/*
 * Para cada volta do looping, ordenamos o vetor de processos e testamos.
 * Se existir 1 processo com o tempo tempo de chegada >= tempo atual, adiciona ao vetor.
 * Se existir mais de 1 processo com o tempo de chegada >= tempo atual,
 * ordena pelo tempo de execução e adiciona no vetor principal.
 */

// Função que calcula o tempo de espera de cada processo
const findWaitingTime = (listaDeProcessos, memoria) => {
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
        let retangulo =  new Retangulo();

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

                preenchePaginasNaMemoria(vetorPrincipal[0], memoria);
                let matrix = stringMatrix(memoria);
                retangulo.novaMatrix = true;
                retangulo.matrix = matrix;

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
                                listaDeProcessos[i].tempoDeEspera = tempoCorrente - vetorPrincipal[0].tempoDeExecucao;
                            }
                        }
                    }
                }

                removePaginasDaMemoria(vetorPrincipal[0], memoria);
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

//Condição de parada
function acabouExecucao(vetorCopiaProcessos, quantidadeDeProcessos) {
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
            listaDeProcessos[i].turnAround = listaDeProcessos[i].tempoDeExecucao + listaDeProcessos[i].tempoDeEspera - listaDeProcessos[i].tempoDeChegada;
        }
    }
}

// Função para calcular o tempo médio
const findavgTimeSJF = (listaDeProcessos) => {
    let total_wt = 0,
        total_tat = 0;
    let quantidadeDeProcessos = listaDeProcessos.length;

    let matrix = new Array(10);
    for(let i = 0 ; i < 10 ; i++){
        matrix[i] = new Array(5).fill('-1');
    }
    let memoria = {
        matrixMemoria: matrix,
        espacosVazios: 50
    }

    // Função para encontrar o tempo de espera de todos os processos
    let listaDeRetangulos = findWaitingTime(listaDeProcessos, memoria);

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
    let quantidadeDePaginas = processo.paginas.length;
    for(let count=0 ; count < quantidadeDePaginas ; count++){
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

    let retorno = findavgTimeSJF(listaDeProcessos);
    retorno.listaDeRetangulos.forEach((retangulo) => {
        console.log("Retângulo " + retangulo.id)
        if(retangulo.novaMatrix)
            console.log(retangulo.matrix)
    })
    //console.log("Lista de retângulos:")
    //console.log(retorno.listaDeRetangulos)

    console.log("TAT:")
    console.log(retorno.Tat);
    console.log("WT:")
    console.log(retorno.Wt);
}

main();

export { findavgTimeSJF }
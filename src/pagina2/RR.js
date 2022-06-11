// Test Setup
import { Processo } from "./Processo.js";
import { Retangulo } from "./Retangulo.js";
import { LRU } from "./LRUPaginacao.js";

// Função para encontrar o tempo de espera para todos os processos
// Retorna a lista de rentagulas e a lista de processos
// Chamar primeiro esse método para pegar lista de retangulos
const findWaitingTime = (listaDeProcessos, quantum, overload, controle) => {
    let quantidadeDeProcessos = listaDeProcessos.length;
    let aux = {
        indice: -1,
        controle: false
    }
    let listaDeRetangulos = [];
    // Vetor de processos
    var priorityEndline = new Array(quantidadeDeProcessos).fill(0);

    for (let i = 0; i < quantidadeDeProcessos; i++)
        priorityEndline[i] = listaDeProcessos[i];

    priorityEndline.sort(function(a, b) {
        if (a.tempoDeChegada > b.tempoDeChegada) {
            return 1;
        }
        if (a.tempoDeChegada < b.tempoDeChegada) {
            return -1;
        }
        return 0;
    });

    let tempoCorrente = 0; // Current time
    let controleTempo = false;
    let foiReordenado = false;
    //Continua percorrendo os processos de maneira round robin até que todos eles estejam completos
    for (let loop = 0;; loop++) {
        // Percorre todos os processos um por um repetidamente
        for (let i = 0; i < quantidadeDeProcessos; i++) {
            //tempo atual maior ou igual o tempo de chegada
            //console.log("Tempo corrente: " + tempoCorrente + " Tempo de chegada do processo " + priorityEndline[i].id + ": " + priorityEndline[i].tempoDeChegada + " Foi executado? " + priorityEndline[i].foiExecutadoPriority)
            if (priorityEndline[i].foiExecutadoPriority == false && priorityEndline[i].ignorar == false) {

                if (tempoCorrente >= priorityEndline[i].tempoDeChegada) {
                    if (!jaEstaNoDisco(controle.vetorDisco, priorityEndline[i].id)) {
                        let index = temEspacoNoDisco(controle.vetorDisco, priorityEndline[i].id); //Procura posição no disco
                        if (index != -1) //Tem espaço no disco
                            controle.vetorDisco[index] = priorityEndline[i].id;
                        else
                            priorityEndline[i].ignorar = true;
                    }

                    if (controleTempo) {
                        tempoCorrente += 1;
                        controleTempo = false;
                    }

                    let retangulo = new Retangulo(priorityEndline[i].id, tempoCorrente, false, 0, false, 0);

                    // Se o tempo de execução de um processo for maior que 0
                    // então precisa processar mais
                    if (priorityEndline[i].tempoDeExecucaoAtual > 0) {
                        preenchePaginasNaMemoria(priorityEndline[i], controle);

                        if (aux["controle"]) {
                            aux["indice"] = -1;
                            aux["controle"] = false;
                        }

                        if (priorityEndline[i].tempoDeExecucaoAtual > quantum) {
                            let retanguloSobrecarga = new Retangulo(priorityEndline[i].id, 0, true);

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

                            // Diminui o tempo de execução do processo atual
                            priorityEndline[i].tempoDeExecucaoAtual -= quantum;

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

                            // Mudança do tempo para controle manual da inserção de um novo elemento
                            controleTempo = true;
                            tempoCorrente -= 1;
                        }

                        // Se o tempo de execução for menor ou igual ao quantum. 
                        // Último ciclo para este processo
                        else {
                            // Aumenta o valor de t, ou seja, mostra quanto tempo um processo foi processado
                            tempoCorrente = tempoCorrente + priorityEndline[i].tempoDeExecucaoAtual;
                            // O tempo de espera é o tempo atual menos o tempo usado por este processo
                            priorityEndline[i].tempoDeEspera = tempoCorrente - priorityEndline[i].tempoDeExecucao - priorityEndline[i].tempoDeChegada;
                            console.log("priorityEndline[i].tempoDeEspera = " + priorityEndline[i].tempoDeEspera);
                            // À medida que o processo é totalmente executado faz seu tempo de execução restante = 0
                            priorityEndline[i].tempoDeExecucaoAtual = 0;

                            let matrixMemoria = stringMatrix(controle);
                            let matrixDisco = stringDisco(controle);
                            let matrixPaginas = stringTabelaPaginas(controle);

                            //Remove as páginas do processo que acabou da memória RAM
                            removePaginasDaMemoria(priorityEndline[i], controle);
                            retangulo.tempoFinal = tempoCorrente;

                            retangulo.matrixMemoria = matrixMemoria;
                            retangulo.matrixDisco = matrixDisco;
                            retangulo.matrixPaginas = matrixPaginas;

                            listaDeRetangulos.push(retangulo)

                            priorityEndline[i].foiExecutadoPriority = true;
                        }

                    }
                }
                //se nenhum processo for executado adiciona 1 ao tempo
                else {
                    if (!aux["controle"]) {
                        aux["indice"] = priorityEndline[i].id;
                        aux["controle"] = true;
                    } else if (aux["indice"] == priorityEndline[i].id) {
                        aux["indice"] = -1;
                        aux["controle"] = false;
                        tempoCorrente++;
                    }
                }
            }

        }

        if (!foiReordenado) {
            priorityEndline.sort(function(a, b) { //ordenando pelo id de cada processo
                if (a.id > b.id) {
                    return 1;
                }
                if (a.id < b.id) {
                    return -1;
                }
                return 0;
            });
            foiReordenado = true;
        }

        let tamanhoLista = priorityEndline.length;
        let acabou = true;
        let contador = 0;
        //console.log(contador)
        for (let j = 0; j < priorityEndline.length; j++) {
            if (priorityEndline[j].ignorar == false) {
                if (priorityEndline[j].foiExecutadoPriority == false)
                    acabou = false;
            }
        }

        //console.log("Priority")
        //console.log(priorityEndline)
        if (acabou) {
            let listasRentaguloEndline = {
                listaDeRetangulos: listaDeRetangulos,
                priorityEndline: priorityEndline
            }
            return listasRentaguloEndline;
        }
    }
}

// Função para calcular turn around time
const findTurnAroundTime = (quantidadeDeProcessos, priorityEndline) => {
    for (let i = 0; i < quantidadeDeProcessos; i++) {
        if (priorityEndline && priorityEndline[i].ignorar == false) {
            console.log(priorityEndline[i].tempoDeExecucao)
            console.log(priorityEndline[i].tempoDeEspera)
            console.log(priorityEndline[i].tempoDeChegada)
            priorityEndline[i].turnAround = priorityEndline[i].tempoDeExecucao + priorityEndline[i].tempoDeEspera;
        }
        //tempo no processador = tempo de execução + tempo de espera - tempo de chegada
    }

}

// Função para calcular o tempo médio
const findavgTimeRR = (listaDeProcessos, quantum = 0, over = 0) => {
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
        //Vetor de disco (memória virtual) - capacidade de 12 processos
        //Quando um processo chega, ele entra no disco
        vetorDisco: new Array(10).fill(-1),
        //Vetor auxiliar (tabela) de páginas com 10 posições
        //Quando é a vez dele de executar, testa se as páginas estão no vetor
        paginas: [] //sempre se adiciona com unshift
    }

    // Função para encontrar o tempo de espera de todos os processos
    let retornoWt = findWaitingTime(listaDeProcessos, quantum, over, controle);
    let priorityEndline = retornoWt.priorityEndline;
    let listaDeRetangulos = retornoWt.listaDeRetangulos;

    // Função para encontrar turn around time de todos os processos
    findTurnAroundTime(quantidadeDeProcessos, priorityEndline);

    // Calcular o tempo total de espera e o total turn around time
    for (let i = 0; i < quantidadeDeProcessos; i++) {
        if (priorityEndline[i].ignorar == false) {

            total_wt = total_wt + priorityEndline[i].tempoDeEspera;
            total_tat = total_tat + priorityEndline[i].turnAround;

            /* console.log("total_wt = " + (total_wt + priorityEndline[i].tempoDeEspera));
            console.log("total_tat = " + (total_tat + priorityEndline[i].turnAround)); */
        }
    }

    let valorWtTat = {
        listaDeRetangulos: listaDeRetangulos,
        Wt: (total_wt / quantidadeDeProcessos),
        Tat: (total_tat / quantidadeDeProcessos)
    }

    printResultados(listaDeRetangulos);

    //console.log(valorWtTat.listaDeRetangulos)

    return valorWtTat;
}

function preenchePaginasNaMemoria(processo, controle) {
    let qtdDePaginasFaltantes = [];
    for (let u = 0; u < processo.posicoesPaginas.length; u++) { //Percorre as paginas do processo
        if (processo.posicoesPaginas[u] == -1) { //processo nunca esteve na matrix
            qtdDePaginasFaltantes.push(processo.paginas[u]);
        } else { //processo ja esteve na matrix
            let i = processo.posicoesPaginas[u].i;
            let j = processo.posicoesPaginas[u].j;
            if (controle.matrixMemoria[i][j].processo != processo.id) { //se o processo nao esta mais na posicao inicial
                qtdDePaginasFaltantes.push(processo.paginas[u]);
            }
        }
    }

    if (qtdDePaginasFaltantes.length == 0) //se todas as paginas estiverem
        return true;
    else {
        trataPaginas(processo, controle);
    }

    if (controle.espacosVaziosMatrixMemoria != 50) { //Caso tenha alguma página
        //Remove páginas da memória ram que não estão mais na tabela de páginas (quadros)
        for (let i = 0; i < 10; i++) { //Percorre as 10 linhas
            for (let j = 0; j < 5; j++) { //Percorre as 5 colunas
                if (controle.matrixMemoria[i][j] != -1) { //Se a posição tá ocupada
                    if (!controle.paginas.includes(controle.matrixMemoria[i][j].valor)) { //Testa se essa posição não tá na tabela
                        controle.matrixMemoria[i][j] = -1;
                        controle.espacosVaziosMatrixMemoria++;
                    }
                    if (processo.paginas.includes(controle.matrixMemoria[i][j].valor) && controle.matrixMemoria[i][j].processo != processo.id) {
                        controle.matrixMemoria[i][j].processo = processo.id;
                        qtdDePaginasFaltantes.splice(qtdDePaginasFaltantes.indexOf(controle.matrixMemoria[i][j].valor), 1);
                    }

                }
            }
        }
    }

    let count = 0;
    let tamOriginal = qtdDePaginasFaltantes.length;
    if (qtdDePaginasFaltantes.length > 0) {
        for (let i = 0; i < 10; i++) { //Percorre as 10 linhas
            for (let j = 0; j < 5; j++) { //Percorre as 5 colunas
                for (let u = 0; u < qtdDePaginasFaltantes.length; u++) {
                    if (controle.matrixMemoria[i][j] == -1) { //Se a posição estiver livre
                        count++;
                        let pagina = {
                            valor: qtdDePaginasFaltantes[u],
                            processo: processo.id
                        }
                        controle.matrixMemoria[i][j] = pagina; //Guarda o valor da página
                        let posicao = { //Objeto com a posição da página na matrix
                            i: i,
                            j: j
                        }
                        processo.posicoesPaginas[processo.paginas.indexOf(qtdDePaginasFaltantes[u])] = posicao; //Guarda a posição no processo
                        controle.espacosVaziosMatrixMemoria--; //Diminui em 1 o número de espaços livres
                        qtdDePaginasFaltantes.shift(); //Remove a página faltante do vetor de faltantes

                        if (count == tamOriginal) //Se todas as páginas foram guardadas
                            return true;
                    }
                }
            }
        }
    }
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
            LRU(controle.paginas, paginasParaTroca[i], 10);
            //console.log(controle.paginas)
        }
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
    let vetor = "\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0";
    let count = 0;
    for (let i = 0; i < 10; i++) {
        count++;
        if (controle.vetorDisco) {
            if (controle.vetorDisco[i] == -1) {
                vetor += ("\xa0- ");
            } else
                vetor += ("\xa0" + controle.vetorDisco[i] + " ");
            if (count % 5 == 0)
                vetor += "\n\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0";
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

function removePaginasDaMemoria(processo, controle) {
    let quantidadeDePaginas = processo.paginas.length;
    //console.log(processo.posicoesPaginas)

    for (let count = 0; count < quantidadeDePaginas; count++) {
        //console.log(processo.id)
        let i = processo.posicoesPaginas[count].i;
        let j = processo.posicoesPaginas[count].j;
        //console.log(i + " i===j " + j)
        controle.matrixMemoria[i][j] = -1;
        controle.espacosVaziosMatrixMemoria++;
        processo.posicoesPaginas[count] = -1;
    }
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
    }
}

function temEspacoNoDisco(vetorDisco, id) {
    for (let i = 0; i < vetorDisco.length; i++) {
        if (vetorDisco[i] == id)
            return -1;
    }

    for (let i = 0; i < vetorDisco.length; i++) {
        if (vetorDisco[i] == -1)
            return i;
    }
    return -1;
}

function jaEstaNoDisco(vetorDisco, id) {
    for (let i = 0; i < vetorDisco.length; i++) {
        if (vetorDisco[i] == id)
            return true;
    }
    return false;
}

function main() {
    let n = 10;

    let quantum = 2;
    let over = 1;

    var teste = new Processo(1, 0, 2, 3, "abcd");
    var teste2 = new Processo(2, 0, 1, 2, "cdwe");
    var teste3 = new Processo(3, 0, 2, 3, "uvbn");
    var teste4 = new Processo(4, 0, 7, 10, "efaq");
    var teste5 = new Processo(5, 0, 4, 6, "nhxv");
    var teste6 = new Processo(6, 0, 3, 5, "lkcd");
    var teste7 = new Processo(7, 0, 1, 2, "pouy");
    var teste8 = new Processo(8, 0, 10, 12, "zywh");
    var teste9 = new Processo(9, 0, 18, 2, "cu");
    var teste10 = new Processo(10, 0, 10, 12, "zywh");

    var listaDeProcessos = new Array(n).fill(0);

    listaDeProcessos[0] = teste;
    listaDeProcessos[1] = teste2;
    listaDeProcessos[2] = teste3;
    listaDeProcessos[3] = teste4;
    listaDeProcessos[4] = teste5;
    listaDeProcessos[5] = teste6;
    listaDeProcessos[6] = teste7;
    listaDeProcessos[7] = teste8;
    listaDeProcessos[8] = teste9;
    listaDeProcessos[9] = teste10;

    ///var teste3 = new Processo(3, 0, 4, 0, "EF");

    //listaDeProcessos[2] = teste3;
    /*
        let testeeee = "ABCDEFGHIJ";
        console.log(listaDeProcessos)
        listaDeProcessos.splice(2)
        console.log(listaDeProcessos)*/

    let retorno = findavgTimeRR(listaDeProcessos, quantum, over);
    //console.log("Lista de retângulos:")
    //console.log(retorno.listaDeRetangulos)
    //console.log("TAT:")
    //console.log(retorno.Tat);
    //console.log("WT:")
    //console.log(retorno.Wt);
}

main();

export { findavgTimeRR }
// Test Setup
import { Processo } from "./Processo.js";
import { Retangulo } from "./Retangulo.js";
import { LRU } from "./LRUPaginacao-SJF.js";

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

    priorityEndline.sort(function(a, b) { //ordenando pelo deadline de cada processo
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
    while (1) {
        let acabou = true;
        // Percorre todos os processos um por um repetidamente
        for (let i = 0; i < quantidadeDeProcessos; i++) {
            //tempo atual maior ou igual o tempo de chegada
            if (tempoCorrente >= priorityEndline[i].tempoDeChegada) {
                let index = temEspacoNoDisco(controle.vetorDisco, priorityEndline[i].id); //Procura posição no disco
                if(index != -1) //Tem espaço no disco
                    controle.vetorDisco[index] = priorityEndline[i].id;

                if (controleTempo) {
                    tempoCorrente += 1;
                    controleTempo = false;
                }

                let retangulo = new Retangulo(priorityEndline[i].id, tempoCorrente, false, 0, false, 0);
                // Se o tempo de execução de um processo for maior que 0
                // então precisa processar mais
                if (priorityEndline[i].tempoDeExecucaoAtual > 0) {
                    preenchePaginasNaMemoria(priorityEndline[i], controle);
                    let matrix = stringMatrix(controle);
                    retangulo.novaMatrix = true;
                    retangulo.matrix = matrix;

                    if (aux["controle"]) {
                        aux["indice"] = -1;
                        aux["controle"] = false;
                    }
                    acabou = false; // Existe um processo pendente

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

                        console.log("Tempo Atual: " + retangulo.tempoInicial)
                        console.log(retangulo.matrix)
                        console.log("Disco:")
                        console.log(controle.vetorDisco)
                        console.log("Paginas:")
                        console.log(controle.paginas)

                        // Diminui o tempo de execução do processo atual
                        priorityEndline[i].tempoDeExecucaoAtual -= quantum;

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
                        // À medida que o processo é totalmente executado faz seu tempo de execução restante = 0
                        priorityEndline[i].tempoDeExecucaoAtual = 0;
                        //Remove as páginas do processo que acabou da memória RAM
                        removePaginasDaMemoria(priorityEndline[i], controle);
                        retangulo.tempoFinal = tempoCorrente;
                        listaDeRetangulos.push(retangulo)
                        
                    }
                }
            }
            //se nenhum processo for executado adiciona 1 ao tempo 
            else {
                if (!aux["controle"]) {
                    aux["indice"] = i;
                    aux["controle"] = true;
                } else if (aux["indice"] == i) {
                    aux["indice"] = -1;
                    aux["controle"] = false;
                    tempoCorrente++;
                }
            }
        }
        // Se todos os processos forem concluídos
        if (acabou == true)
            break;

        if (!foiReordenado) {
            priorityEndline.sort(function(a, b) { //ordenando pelo deadline de cada processo
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
    }
    let listasRentaguloEndline = {
        listaDeRetangulos: listaDeRetangulos,
        priorityEndline: priorityEndline
    }
    return listasRentaguloEndline;
}

// Função para calcular turn around time
const findTurnAroundTime = (quantidadeDeProcessos, priorityEndline) => {
    for (let i = 0; i < quantidadeDeProcessos; i++) {
        if (priorityEndline)
        //tempo no processador = tempo de execução + tempo de espera - tempo de chegada
            priorityEndline[i].turnAround = priorityEndline[i].tempoDeExecucao + priorityEndline[i].tempoDeEspera - priorityEndline[i].tempoDeChegada;
    }

}

// Função para calcular o tempo médio
const findavgTimeRR = (listaDeProcessos, quantum = 0, over = 0) => {
    let quantidadeDeProcessos = listaDeProcessos.length;

    let total_wt = 0,
        total_tat = 0;

    let matrix = new Array(10);
    for(let i = 0 ; i < 10 ; i++){
        matrix[i] = new Array(5).fill('-1');
    }
    let controle = {
        matrixMemoria: matrix,
        espacosVaziosMatrixMemoria: 50,
        //Vetor de disco (memória virtual) - capacidade de 12 processos
        //Quando um processo chega, ele entra no disco
        vetorDisco: new Array(12).fill(-1),
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
        total_wt = total_wt + priorityEndline[i].tempoDeEspera;
        total_tat = total_tat + priorityEndline[i].turnAround;
    }

    let valorWtTat = {
        listaDeRetangulos: listaDeRetangulos,
        Wt: (total_wt / quantidadeDeProcessos),
        Tat: (total_tat / quantidadeDeProcessos)
    }

    //console.log("Disco:")
    //console.log(controle.vetorDisco)
    //console.log("Paginas:")
    //console.log(controle.paginas)

    return valorWtTat;
}

function preenchePaginasNaMemoria(processo, controle) {
    let qtdDePaginasFaltantes = [];
    //console.log("Páginas começo:")
    //console.log(controle.paginas);
    for (let u = 0; u < processo.posicoesPaginas.length; u++) { //Percorre as paginas do processo
        if (processo.posicoesPaginas[u] == '-1') { //processo nunca esteve na matrix
            qtdDePaginasFaltantes.push(processo.paginas[u]);
        }
        else { //processo ja esteve na matrix
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
        for (let i = 0; i < processo.paginas.length; i++)
            trataPaginas(processo, controle);
    }

    if (controle.espacosVaziosMatrixMemoria != 50) { //Caso tenha alguma página
        //Remove páginas da memória ram que não estão mais na tabela de páginas (quadros)
        for (let i = 0; i < 10; i++) { //Percorre as 10 linhas
            for (let j = 0; j < 5; j++) { //Percorre as 5 colunas
                if (controle.matrixMemoria[i][j] != '-1') { //Se a posição tá ocupada
                    if (!controle.paginas.includes(controle.matrixMemoria[i][j].valor)) { //Testa se essa posição não tá na tabela
                        controle.matrixMemoria[i][j] = '-1';
                        controle.espacosVaziosMatrixMemoria++;
                    }
                    if(processo.paginas.includes(controle.matrixMemoria[i][j].valor) && controle.matrixMemoria[i][j].processo != processo.id)
                        controle.matrixMemoria[i][j].processo = processo.id;
                }
            }
        }
    }

    let count = 0;
    for (let i = 0; i < 10; i++) { //Percorre as 10 linhas
        for (let j = 0; j < 5; j++) { //Percorre as 5 colunas
           for (let u=0 ; u < controle.paginas.length ; u++) {
                if (controle.matrixMemoria[i][j] == '-1') { //Se a posição estiver livre
                    let pagina = {
                        valor: qtdDePaginasFaltantes[u],
                        processo: processo.id
                    }
                    controle.matrixMemoria[i][j] = pagina; //Guarda o valor da página
                    let posicao = { //Objeto com a posição da página na matrix
                        i: i,
                        j: j
                    }
                    //processo.posicoesPaginas[processo.paginas.indexOf(paginaFaltante)] = posicao; //Guarda a posição no processo
                    processo.posicoesPaginas[count] = posicao; //Guarda a posição no processo
                    count++; //Passa pra próxima página
                    controle.espacosVaziosMatrixMemoria--; //Diminui em 1 o número de espaços livres
                    if (count == processo.paginas.length) //Se todas as páginas foram guardadas
                        return true;
                    else 
                        qtdDePaginasFaltantes.shift(); //Remove a página faltante do vetor de faltantes
                }
            }
        }
    }
    //console.log(processo.posicoesPaginas)
}

function trataPaginas(processo, controle){
    let paginasParaTroca = [];
    let qtdDePaginas = processo.paginas.length;
    for(let i = 0 ; i < qtdDePaginas ; i++){
        if(!controle.paginas.includes(processo.paginas[i])){
            if(controle.paginas.length == 10)
                paginasParaTroca.push(processo.paginas[i]);
            else if(controle.paginas.length < 10)
                controle.paginas.unshift(processo.paginas[i]);
        }    
    }
    if(paginasParaTroca.length > 0){
        for(let i = 0 ; i < paginasParaTroca.length ; i++){
            LRU(controle.paginas, paginasParaTroca[i], 10);
            //console.log(controle.paginas)
        }
    }
}

function stringMatrix(controle) {
    let matrix = "";
    for (let i = 0; i < 10; i++) { //Percorre as 10 linhas
        for (let j = 0; j < 5; j++) { //Percorre as 5 colunas
            if(controle.matrixMemoria){
                if(controle.matrixMemoria[i][j] != "-1"){
                    matrix += "\xa0"
                    matrix += ("\xa0" + controle.matrixMemoria[i][j].processo + " ");
                }
                else 
                    matrix += ("\xa0" + controle.matrixMemoria[i][j] + " ");
            }
        }
        matrix += "\n";
    }
    return matrix;
}

function removePaginasDaMemoria(processo, controle) {
    let quantidadeDePaginas = processo.paginas.length;
    //console.log(processo.posicoesPaginas)

    for(let count=0 ; count < quantidadeDePaginas ; count++){
        let i = processo.posicoesPaginas[count].i;
        let j = processo.posicoesPaginas[count].j;
        //console.log(i + " i===j " + j)
        controle.matrixMemoria[i][j] = '-1';
        controle.espacosVaziosMatrixMemoria++;
        processo.posicoesPaginas[count] = '-1';
    }
}

function temEspacoNoDisco(vetorDisco, id) {
    for (let i = 0; i < vetorDisco.length ; i++){
        if(vetorDisco[i] == id)
            return -1;
    }

    for (let i = 0; i < vetorDisco.length ; i++){
        if(vetorDisco[i] == -1)
            return i;
    }
    return -1;
}

function main() {
    let n = 3;

    let quantum = 2;
    let over = 1;

    var teste = new Processo(1, 0, 4, 0, "ABCDEFGHIJ");
    var teste2 = new Processo(2, 2, 6, 0, "MDFJD");
    var teste3 = new Processo(3, 4, 7, 0, "ÇVCX976");

    var listaDeProcessos = new Array(n).fill(0);
    listaDeProcessos[0] = teste;
    listaDeProcessos[1] = teste2;
    listaDeProcessos[2] = teste3;

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
 /*
 O algoritmo funciona da seguinte forma:
 Se já há referência para a pagina buscada : coloca "NF"(Não Falta) no indice correspondente
 na lista de faltas, no momento em que não ocorreu a falta.
 Se não há referência para a página buscada: coloca "F" (Falta) no indice correspondente
 na lista de faltas, no momento em que ocorreu a falta - Se há espaço livre na memória, a página 
 é adicionada. Se não há espaço livre na memória, retira da memória a primeira página referenciada
 e adiciona a nova página no lugar.
  */

 //Numero maximo para execução de um processo é 10
 //Então o número de quadros é 10
 function FIFO(vetorDePaginas, pagina, numeroDeQuadros) { 
     /*console.log("Dentro do FIFO")
     console.log(vetorDePaginas)*/
    let pagEmMemoria = vetorDePaginas; //Lista de páginas que estão na memória
    let pagEmMemoriaArray = []; //vetor da lista de páginas que estão na memória

    //Não há referência para a pagina buscada:há falta de página
    if (!pagEmMemoria.includes(pagina)) {
        //Se há espaço livre na memória
        if (pagEmMemoria.length < numeroDeQuadros) {
            //adiciona na primeira posição livre 
            pagEmMemoria.unshift(pagina);
        } 
        //Se não há espaço livre
        else {
            pagEmMemoria.pop();
            //pagEmMemoria.shift(); //teste para rodar main
            pagEmMemoria.unshift(pagina);
        }
    }

    pagEmMemoriaArray.push(...pagEmMemoria); //Joga o vetor de paginas em memória dentro de um outro vetor

    //console.log("Páginas em memória:")
    //console.log(pagEmMemoriaArray)
    
    //Retorna todos os vetores
    /*console.log("Saida do FIFO")
    console.log(pagEmMemoriaArray)*/
    return pagEmMemoriaArray;
}

function main() {
	let numeroDeQuadros = 10;
    let vetorDePaginas = ['A','B','C','D','E','F','G','H','I']
    vetorDePaginas.push('J')

    let pagina = 'k';
    FIFO(vetorDePaginas,pagina, numeroDeQuadros);  
}

//main();


export { FIFO }
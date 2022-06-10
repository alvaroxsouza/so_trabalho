 /*
 O algoritmo funciona da seguinte forma:
 Se já há referência para a pagina buscada : coloca "NF"(Não Falta) no indice correspondente
 na lista de faltas, no momento em que não ocorreu a falta. 
 Se não há referência para a página buscada: coloca "F" (Falta) no indice correspondente
 na lista de faltas, no momento em que ocorreu a falta - Se há espaço livre na memória, a página 
 é adicionada. Se não há espaço livre na memória, retira da memória a página referenciada a mais
 tempo e adiciona a nova página no lugar.
  */

function LRU(vetorDePaginas, pagina, numeroDeQuadros) {
    let pagEmMemoria = vetorDePaginas; //Lista de páginas que estão na memória
    let pagEmMemoriaArray = []; //vetor da lista de páginas que estão na memória    

    if (pagEmMemoria.includes(pagina)){
        //Atualizando ele como acessado no momento
        pagEmMemoria.splice(pagEmMemoria.indexOf(pagina),1);
        pagEmMemoria.unshift(pagina);
    }
     //Não há referência para a pagina buscada:há falta de página
    else{
        //Se há espaço livre na memória
        if (pagEmMemoria.length < numeroDeQuadros){
            //adiciona na primeira posição livre
            pagEmMemoria.unshift(pagina);
        }
         //Se não há espaço livre
        else{
            pagEmMemoria.pop(); //Retira a página que tá no vetor de páginas que estão dentro da memória
                                // e coloca no vetor de páginas que não estão dentro da memória
            //adiciona a página
            pagEmMemoria.unshift(pagina);
        }
    }    
    pagEmMemoriaArray.push(...pagEmMemoria); //Joga o vetor de paginas em memória dentro de um outro vetor

    //console.log("Páginas em memória:")
    //console.log(pagEmMemoriaArray)
    
    //Retorna todos os vetores
    /*console.log("Vetor de paginas na troca")
    console.log(pagEmMemoriaArray)*/
    return pagEmMemoriaArray;
}

function main() {
	let numeroDeQuadros = 10;
    let vetorDePaginas = [];
    vetorDePaginas.unshift('A')
    vetorDePaginas.unshift('B')
    vetorDePaginas.unshift('C')
    vetorDePaginas.unshift('D')
    vetorDePaginas.unshift('E')
    vetorDePaginas.unshift('F')
    vetorDePaginas.unshift('G')
    vetorDePaginas.unshift('H')
    vetorDePaginas.unshift('I')
    vetorDePaginas.unshift('J')

    let pagina = 'k';
    LRU(vetorDePaginas, pagina, numeroDeQuadros);  
}

//main();

export { LRU }
 /*
 O algoritmo funciona da seguinte forma:
 Se já há referência para a pagina buscada : coloca "NF"(Não Falta) no indice correspondente
 na lista de faltas, no momento em que não ocorreu a falta. 
 Se não há referência para a página buscada: coloca "F" (Falta) no indice correspondente
 na lista de faltas, no momento em que ocorreu a falta - Se há espaço livre na memória, a página 
 é adicionada. Se não há espaço livre na memória, retira da memória a página referenciada a mais
 tempo e adiciona a nova página no lugar.
  */

function LRU(stringDeReferencia, numeroDeQuadros) {
    let pagEmMemoria = []; //Lista de páginas que estão na memória
    let faltaDePagina = []; //Lista de faltas 
    let pagEmMemoriaArray = []; //vetor da lista de páginas que estão na memória
    let pafNaoEstaNaMemoria = []; //Lista de páginas que não estão na memória
    let pafNaoEstaNaMemoriaArray = []; //vetor da lista de páginas que não estão na memória
    

    for (let i = 0; i < stringDeReferencia.length ; i++){
        //Já há referência para a página buscada: não há falta de página
        if (pagEmMemoria.includes(stringDeReferencia[i])){
            faltaDePagina.push('NF');
            //Atualizando ele como acessado no momento
            pagEmMemoria.splice(pagEmMemoria.indexOf(stringDeReferencia[i]),1);
            pagEmMemoria.unshift(stringDeReferencia[i]);
        }
         //Não há referência para a pagina buscada:há falta de página
        else{
            faltaDePagina.push('F');
            //Se há espaço livre na memória
            if (pagEmMemoria.length < numeroDeQuadros){
                //adiciona na primeira posição livre
                pagEmMemoria.unshift(stringDeReferencia[i]);
            }
             //Se não há espaço livre
            else{
                if (pafNaoEstaNaMemoria.length >= numeroDeQuadros) {
                    pafNaoEstaNaMemoria.pop(); //Retira a página que estava no vetor de páginas que não estão dentro da memória
                }
                pafNaoEstaNaMemoria.unshift(pagEmMemoria.pop()); //Retira a página que tá no vetor de páginas que estão dentro da memória
                                                        // e coloca no vetor de páginas que não estão dentro da memória
                //adiciona a página
                pagEmMemoria.unshift(stringDeReferencia[i]);
            }
        }
        pagEmMemoriaArray.push([...pagEmMemoria]);
        pafNaoEstaNaMemoriaArray.push([...pafNaoEstaNaMemoria]);
    }
    
    console.log("Controle de falta de páginas:")
    console.log(faltaDePagina)
    console.log("Páginas em memória:")
    console.log(pagEmMemoriaArray)
    console.log("Páginas que não estão na memória:")
    console.log(pafNaoEstaNaMemoriaArray)
    
    //Retorna todos os vetores
    return {pagEmMemoriaArray, faltaDePagina, pafNaoEstaNaMemoriaArray};
}

function main() {
	let numeroDeQuadros = 4;
    let stringDeReferencia = "70120304230321201701" 
    LRU(stringDeReferencia, numeroDeQuadros);  
}

main();
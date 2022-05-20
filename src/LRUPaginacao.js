 /*
 O algoritmo funciona da seguinte forma:
 Se já há referência para a pagina buscada : coloca "NF"(Não Falta) no indice correspondente
 na lista de faltas, no momento em que não ocorreu a falta. 
 Se não há referência para a página buscada: coloca "F" (Falta) no indice correspondente
 na lista de faltas, no momento em que ocorreu a falta - Se há espaço livre na memória, a página 
 é adicionada. Se não há espaço livre na memória, retira da memória a página referenciada a mais
 tempo e adiciona a nova página no lugar.
  */

function leastRecentlyUsed(referenceString, frameNumber) {
    let pageInMem = []; //Lista de páginas que estão na memória
    let pageFaults = []; //Lista de faltas 
    let pageInMemArray = []; //vetor da lista de páginas que estão na memória
    let pageNotInMem = []; //Lista de páginas que não estão na memória
    let pageNotInMemArray = []; //vetor da lista de páginas que não estão na memória
    

    for (let i = 0; i < referenceString.length ; i++){
        //Já há referência para a página buscada: não há falta de página
        if (pageInMem.includes(referenceString[i])){
            pageFaults.push('NF');
            //Atualizando ele como acessado no momento
            pageInMem.splice(pageInMem.indexOf(referenceString[i]),1);
            pageInMem.unshift(referenceString[i]);
        }
         //Não há referência para a pagina buscada:há falta de página
        else{
            pageFaults.push('F');
            //Se há espaço livre na memória
            if (pageInMem.length < frameNumber){
                //adiciona na primeira posição livre
                pageInMem.unshift(referenceString[i]);
            }
             //Se não há espaço livre
            else{
                if (pageNotInMem.length >= frameNumber) {
                    pageNotInMem.pop(); //Retira a página que estava no vetor de páginas que não estão dentro da memória
                }
                pageNotInMem.unshift(pageInMem.pop()); //Retira a página que tá no vetor de páginas que estão dentro da memória
                                                        // e coloca no vetor de páginas que não estão dentro da memória
                //adiciona a página
                pageInMem.unshift(referenceString[i]);
            }
        }
        pageInMemArray.push([...pageInMem]);
        pageNotInMemArray.push([...pageNotInMem]);
    }
    
    console.log(pageFaults)
    console.log(pageInMemArray)
    console.log(pageNotInMemArray)
    
    //Retorna todos os vetores
    return {pageInMemArray, pageFaults, pageNotInMemArray};
}

function main() {
	let frameNumber = 4;
    let referenceString = "70120304230321201701" 
    leastRecentlyUsed(referenceString, frameNumber);  
}

main();
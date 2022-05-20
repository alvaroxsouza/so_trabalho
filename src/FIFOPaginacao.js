 function firstInFirstOut(referenceString, frameNumber) {
    let pageInMem = []; //Lista de páginas que estão na memória
    let pageFaults = []; //Lista de faltas 
    let pageInMemArray = []; //vetor da lista de páginas que estão na memória
    let pageNotInMem = []; //Lista de páginas que não estão na memória
    let pageNotInMemArray = []; //vetor da lista de páginas que não estão na memória
    
    for (let i = 0; i < referenceString.length; i++) {
            //Já a referência para a pagina buscada: não há falta de página
            if (pageInMem.includes(referenceString[i])) {
                pageFaults.push('NF');
            } else {
                //Não a referência para a pagina buscada:há falta de página
                pageFaults.push('F');
                //Se há espaço livre na memória
                if (pageInMem.length < frameNumber) {
                    //adiciona na primeira posição livre 
                    pageInMem.unshift(referenceString[i]);
                } 
                //Se não há espaço livre
                else {
                    if (pageNotInMem.length >= frameNumber) {
                        pageNotInMem.pop(); //Retira a página que estava no vetor de páginas que não estão dentro da memória 
                    }
                    pageNotInMem.unshift(pageInMem.pop()); //Retira a página que tá no vetor de páginas que estão dentro da memória
                                                            // e coloca no vetor de páginas que não estão dentro da memória
                    //adiciona a página
                    pageInMem.unshift(referenceString[i]);
                }
            }
        pageInMemArray.push([...pageInMem]); //Joga o vetor de paginas em memória dentro de um outro vetor
        pageNotInMemArray.push([...pageNotInMem]); //Joga o vetor de paginas que não estão dentro da memória dentro de um outro vetor
    }
    
    //Retorna todos os vetores
    console.log(pageFaults)
    console.log(pageInMemArray)
    console.log(pageNotInMemArray)
    
    return {pageInMemArray, pageFaults, pageNotInMemArray};
}

function main() {
	let frameNumber = 3;
    let referenceString = "70120304230321201701" 
    firstInFirstOut(referenceString, frameNumber);  
}

main();
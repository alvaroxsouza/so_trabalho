/* const tempoDeExecucaoTotal = (processes, n) => {

    let tempoCorrente = 0;

    processes.sort(function(a, b) { //sort para ordenar o tempo de chegada
        if (a.tempoDeChegada > b.tempoDeChegada) {
            return 1;
        }
        if (a.tempoDeChegada < b.tempoDeChegada) {
            return -1;
        }
        return 0;
    });

    console.log(tempoCorrente)

    var tempoRetangulos = new Array(n).fill(0); //vetor com o tempo de cada retangulo
    for (let i = 0; i < n; i++) {
        if (processes[i].tempoDeChegada > tempoCorrente) {
            tempoCorrente += processes[i].tempoDeChegada - tempoCorrente;
        }
        var retangulo = { //objeto que guarda o id, tmepo inicial e tempo final de um retangulo
                id: processes[i].id,
                tempoInicial: tempoCorrente,
                tempoFinal: 0
            }
            //tempo atual maior ou igual o tempo de chegada
        tempoCorrente += processes[i].tempoDeExecucao; //tempo de execução
        retangulo["tempoFinal"] = tempoCorrente; // guarda o tempo final do retangulo
        tempoTotal += tempoCorrente - processes[i].tempoDeChegada; //tempo de execução menos os tempos de chegada
        //se nenhum processo for executado adiciona 1 ao tempo 
        tempoRetangulos[i] = retangulo; //guarda o objeto retangulo no vetor
    }
    return tempoRetangulos;
} */
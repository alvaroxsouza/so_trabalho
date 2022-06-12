/* Classe de um processo que guarda os dados do mesmo.*/
class Processo {
    constructor(id, tempoDeChegada = 0, tempoDeExecucao = 0, deadline = 0, paginas = "0") {
        this.id = id; //Id do processo
        this.tempoDeChegada = tempoDeChegada; //Tempo de chegada do processo
        this.tempoDeExecucao = tempoDeExecucao; //Tempo de execucao do processo
        this.tempoDeExecucaoAtual = tempoDeExecucao; //Tempo restante de execucao do processo
        this.deadlineEstaEstourado = false; //Guarda se o deadline no processo foi estourado
        this.deadline = deadline + tempoDeChegada;  //Calcula em que momento o deadline vai acontecer
        this.tempoDeEspera = 0; //Tempo de espera do processo
        this.turnAround = 0; //Turn Around do processo
        this.tempoQueComecou = 0; //Tempo que o processo comecou a executar
        this.paginas = paginas.substring(0,10); //Guarda as páginas a serem usadas no processo
        this.posicoesPaginas = new Array(this.paginas.length).fill('-1'); //Guarda as posicoes das paginas desse processo na matrix de memoria
        this.foiExecutadoPriority = false; //Diz se o processo foi executado alguma vez no RR
        this.ignorar = false; //Define se o processo deve ser ignorado caso o disco esteja cheio no RR
    }

    getId() {
        return this.id;
    }

    setId(id) {
        this.id = id;
    }

    getTempoDeChegada() {
        return this.tempoDeChegada;
    }

    setTempoDeChegada(tempoDeChegada) {
        this.tempoDeChegada = tempoDeChegada;
    }

    getTempoDeExecucao() {
        return this.tempoDeExecucao;
    }

    setTempoDeExecucao(tempoDeExecucao) {
        this.tempoDeExecucao = tempoDeExecucao;
    }

    getTempoDeExecucaoAtual() {
        return this.tempoDeExecucaoAtual;
    }

    setTempoDeExecucaoAtual(tempoDeExecucaoAtual) {
        this.tempoDeExecucaoAtual = tempoDeExecucaoAtual;
    }

    getDeadlineEstaEstourado() {
        return this.deadlineEstaEstourado;
    }

    setDeadlineEstaEstourado(deadlineEstaEstourado) {
        this.deadlineEstaEstourado = deadlineEstaEstourado;
    }

    getTempoDeEspera() {
        return this.tempoDeEspera;
    }

    setTempoDeEspera(TempoDeEspera) {
        this.tempoDeEspera = TempoDeEspera;
    }

    getTurnAround() {
        return this.turnAround;
    }

    setTurnAround(turnAround) {
        this.turnAround = turnAround;
    }

    getDeadline() {
        return this.Deadline;
    }

    setDeadline(deadline) {
        this.deadline = deadline;
    }

    getPaginas() {
        return this.paginas;
    }

    setPaginas(paginas) {
        this.paginas = paginas;
    }

    getPosicoesPaginas() {
        return this.posicoesPaginas;
    }

    setPosicoesPaginas(posicoesPaginas) {
        this.posicoesPaginas = posicoesPaginas;
    }
}
export { Processo };
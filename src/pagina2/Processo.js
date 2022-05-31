class Processo {
    constructor(id, tempoDeChegada = 0, tempoDeExecucao = 0, deadline = 0, paginas = "0") {
        this.id = id;
        this.tempoDeChegada = tempoDeChegada;
        this.tempoDeExecucao = tempoDeExecucao;
        this.tempoDeExecucaoAtual = tempoDeExecucao;
        this.deadlineEstaEstourado = false;
        this.deadline = deadline + tempoDeChegada;
        this.tempoDeEspera = 0;
        this.turnAround = 0;
        this.tempoQueComecou = 0;
        this.paginas = paginas.substring(0,10);
        this.posicoesPaginas = new Array(this.paginas.length).fill('-1');
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
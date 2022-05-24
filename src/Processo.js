class Processo {
    constructor(id, tempoDeChegada = 0, tempoDeExecucao = 0, deadline = 0) {
        this.id = id;
        this.tempoDeChegada = tempoDeChegada;
        this.tempoDeExecucao = tempoDeExecucao;
        this.tempoDeExecucaoAtual = tempoDeExecucao;
        this.deadlineEstaEstourado = false;
        this.deadline = 0;
        this.tempoDeEspera = 0;
        this.turnAround = 0;
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
}
export { Processo };
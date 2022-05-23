class Processo {
    constructor(id, tempoDeChegada, tempoDeExecucao) {
        this.id = id;
        this.tempoDeChegada = tempoDeChegada;
        this.tempoDeExecucao = tempoDeExecucao;
        this.tempoDeExecucaoAtual = tempoDeExecucao;
        this.deadlineEstaEstourado = false;
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
}
export { Processo };
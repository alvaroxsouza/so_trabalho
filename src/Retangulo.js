class Retangulo {
    constructor(id = -1, tempoInicial = 0, sobrecarga = false, tempoFinal = 0, isDeadline = false, deadline = -1) {
        this.id = id,
        this.tempoInicial = tempoInicial,
        this.tempoFinal = tempoFinal,
        this.sobrecarga = sobrecarga,
        this.isDeadline = isDeadline,
        this.deadline = deadline
    }

    getId() {
        return this.id;
    }

    setId(id) {
        this.id = id;
    }

    getTempoInicial() {
        return this.tempoInicial;
    }

    setTempoInicial(tempoInicial) {
        this.tempoInicial = tempoInicial;
    }

    getTempoFinal() {
        return this.tempoFinal;
    }

    setTempoFinal(tempoFinal) {
        this.tempoFinal = tempoFinal;
    }

    isSobrecarga() {
        return this.sobrecarga;
    }

    setSobrecarga(sobrecarga) {
        this.sobrecarga = sobrecarga;
    }

    isDeadline() {
        return this.isDeadline;
    }

    setIsDeadline(isDeadline) {
        this.isDeadline = isDeadline;
    }

    getDeadline() {
        return this.deadline;
    }

    setDeadline(deadline) {
        this.deadline = deadline;
    }
}
export { Retangulo };
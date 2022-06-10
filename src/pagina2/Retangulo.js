class Retangulo {
    constructor(id = -1, tempoInicial = 0, sobrecarga = false, tempoFinal = 0, deadlineBool = false, deadline = -1, novaMatrix = false, matrixMemoria = "", matrixDisco = "", matrixPaginas="") {
        this.id = id;
        this.tempoInicial = tempoInicial;
        this.tempoFinal = tempoFinal;
        this.sobrecarga = sobrecarga;
        this.deadlineBool = deadlineBool;
        this.deadline = deadline;
        this.novaMatrix = novaMatrix;
        this.matrixMemoria = matrixMemoria;
        this.matrixDisco = matrixDisco;
        this.matrixPaginas = matrixPaginas;
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

    isDeadlineBool() {
        return this.deadlineBool;
    }

    setIsDeadlineBool(deadlineBool) {
        this.deadlineBool = deadlineBool;
    }

    getDeadline() {
        return this.deadline;
    }

    setDeadline(deadline) {
        this.deadline = deadline;
    }

    getMatrixMemoria() {
        return this.matrixMemoria;
    }

    getMatrixDisco() {
        return this.matrixDisco;
    }

    getMatrixPaginas() {
        return this.matrixPaginas;
    }
}
export { Retangulo };
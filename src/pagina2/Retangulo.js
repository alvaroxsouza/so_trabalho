/* Classe de um retangulo para desenho no gráfico de Gantt.*/
/* Cada retangulo corresponde a uma execução continua, ou seja, sem ser interrompido para troca ou sobrecarga.*/
class Retangulo { 
    constructor(id = -1, tempoInicial = 0, sobrecarga = false, tempoFinal = 0, deadlineBool = false, deadline = -1, novaMatrix = false, matrixMemoria = "", matrixDisco = "", matrixPaginas="") {
        this.id = id; //Id do processo desse retangulo
        this.tempoInicial = tempoInicial; //Tempo no qual o retangulo comeca
        this.tempoFinal = tempoFinal; //Tempo no qual o retangulo termina
        this.sobrecarga = sobrecarga; //Diz se o retangulo representa uma sobrecarga
        this.deadlineBool = deadlineBool; //Diz se nesse retangulo ocorre deadline
        this.deadline = deadline; //Diz em qual tempo nesse processo o deadline comeca
        this.novaMatrix = novaMatrix; //Diz se a matrix vai ser atualizada nesse retangulo
        this.matrixMemoria = matrixMemoria; //Guarda a string da matrix da memoria para apresentar no console
        this.matrixDisco = matrixDisco; //Guarda a string da matrix do disco para apresentar no console
        this.matrixPaginas = matrixPaginas; //Guarda a string da matrix de paginas para apresentar no console
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
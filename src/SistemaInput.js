class SistemaInput {
    constructor(quantum = 0, sobrecarga = 0) {
        this.quantum = quantum;
        this.sobrecarga = sobrecarga;
    }

    setQuantum(quantum) {
        this.quantum = quantum;
    }

    getQuantum() {
        return this.quantum;
    }

    setSobrecarga(sobrecarga) {
        this.sobrecarga = sobrecarga;
    }

    getSobrecarga() {
        return this.sobrecarga;
    }
}

export { SistemaInput }
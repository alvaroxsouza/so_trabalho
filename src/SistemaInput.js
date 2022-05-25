class SistemaInput {
    constructor(quantum, sobrecarga) {
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
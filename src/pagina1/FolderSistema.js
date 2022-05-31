import { Processo } from "./Processo.js";

const LIMITE_SUPERIOR = 1000;
const LIMITE_INFERIOR = 0;

function controlFolderSistema(sistemaFolder, sistema, gui) {
    sistemaFolder = gui.addFolder('Sistema');

    let objetoSistema = { Quantum: 0, Sobrecarga: 0 }

    sistemaFolder.add(objetoSistema, 'Quantum', LIMITE_INFERIOR, LIMITE_SUPERIOR, 1)
        .onChange((value) => { sistema.setQuantum(value); })

    sistemaFolder.add(objetoSistema, 'Sobrecarga', LIMITE_INFERIOR, LIMITE_SUPERIOR, 1)
        .onChange((value) => { sistema.setSobrecarga(value); })

    sistemaFolder.open()
}

function controlFolderProcessos(processosFolder, gui, quantidadeDeProcessos, listaDeProcessos) {

    processosFolder = gui.addFolder('Processos');

    let processos = {
        'Adiciona Processo': addProcesso(quantidadeDeProcessos, processosFolder, listaDeProcessos),
        'Remove Processo': removeProcesso(quantidadeDeProcessos, processosFolder, listaDeProcessos, gui)
    };
    console.log(processos)
    processosFolder.add(processos, 'Adiciona Processo').onChange();
    processosFolder.add(processos, 'Remove Processo').onChange();

    processosFolder.open()
}

function controlAlgoritmosFolder(algoritmosFolder, listaDeProcessos, gui, executaAlgoritmoDeEscalonamento) {

    algoritmosFolder = gui.addFolder('Algoritmos de Escalonamento');
    let entradaVazia = { Algoritmo: '' };
    const algoritmosDeEscalonamento = ['FIFO', 'Round-Robin', 'EDF', 'SJF'];
    algoritmosFolder.add(entradaVazia, 'Algoritmo').options(algoritmosDeEscalonamento)
        .onChange((value) => executaAlgoritmoDeEscalonamento(value, listaDeProcessos))
    algoritmosFolder.open();

}

function controlIniciarFolder(iniciarProcessosFolder, speedAnimation, gui) {
    iniciarProcessosFolder = gui.addFolder('Iniciar');
    let iniciarProcessos = { Inicia: iniciar, 'Velocidade da animação': 0 };
    iniciarProcessosFolder.add(iniciarProcessos, 'Inicia');
    iniciarProcessosFolder.add(iniciarProcessos, 'Velocidade da animação', LIMITE_INFERIOR, LIMITE_SUPERIOR, 1)
        .onChange((value) => { speedAnimation += value });
    iniciarProcessosFolder.open()
}

function addProcesso(quantidadeDeProcessos, processosFolder, listaDeProcessos) {
    quantidadeDeProcessos++;
    let processoCorrenteController = processosFolder.addFolder('Processo ' + quantidadeDeProcessos);
    let processoVariaveis = { 'Tempo de Chegada': 0, 'Tempo de Execução': 0, 'Deadline': 0 }
    const processoCorrente = new Processo(quantidadeDeProcessos - 1)
    processoCorrenteController.add(processoVariaveis, 'Tempo de Chegada', LIMITE_INFERIOR, LIMITE_SUPERIOR, 1)
        .onChange((value) => { processoCorrente.setTempoDeChegada(value); });
    processoCorrenteController.add(processoVariaveis, 'Tempo de Execução', LIMITE_INFERIOR, LIMITE_SUPERIOR, 1)
        .onChange((value) => { processoCorrente.setTempoDeExecucao(value); });
    processoCorrenteController.add(processoVariaveis, 'Deadline', LIMITE_INFERIOR, LIMITE_SUPERIOR, 1)
        .onChange((value) => { processoCorrente.setDeadline(value); });
    listaDeProcessos.push(processoCorrente)
}

function removeProcesso(quantidadeDeProcessos, listaDeProcessos, gui) {
    if (quantidadeDeProcessos > 0) {
        processosFolder.removeFolder(gui.__folders.Processos.__folders['Processo ' + quantidadeDeProcessos])
        listaDeProcessos.pop()
        quantidadeDeProcessos--;
    }
}

function iniciar() {
    if (scene.children.length > 2) {
        for (let i = scene.children.length - 1; i >= 62; i--) {
            scene.remove(scene.children[i]);
        }
    }
    render()
    speed = 0.0;
}

export { controlAlgoritmosFolder, controlFolderSistema, controlFolderProcessos, controlIniciarFolder };
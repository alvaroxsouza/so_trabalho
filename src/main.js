import * as THREE from '../node_modules/three/build/three.module.js';
import { GUI } from '../node_modules/dat.gui/build/dat.gui.module.js';

const gui = new GUI({ name: "Escalonamento", width: 500 })

var scene, renderer, camera, axesHelper;

/* Pastas do GUI */
var sistemaFolder, processosFolder, iniciarProcessosFolder, algoritmosFolder;

var quantidadeDeProcessos = 0;

const LIMITE_SUPERIOR = 100;
const LIMITE_INFERIOR = 0;

var listaDeProcessos = [];

/* Estrutura para guardar o quantum e a sobrecarga do sistema */
class SistemaInput {
    constructor(quantum, sobrecarga) {
        this.quantum = quantum;
        this.sobrecarga = sobrecarga;
    }

    setQuantum(quantum) {
        this.quantum = quantum;
    }

    setSobrecarga(sobrecarga) {
        this.sobrecarga = sobrecarga;
    }
}

var sistema = new SistemaInput();

/* Classe que guarda as variáveis obtidas através dos controllers, para os processos */
class ProcessoInput {
    constructor(tempoDeChegada = 0, tempoDeExecucao = 0, deadline = 0) {
        this.tempoDeChegada = tempoDeChegada;
        this.tempoDeExecucao = tempoDeExecucao;
        this.deadline = deadline;
    }

    setTempoDeChegada(tempoDeChegada) {
        this.tempoDeChegada = tempoDeChegada;
    }

    setTempoDeExecucao(tempoDeExecucao) {
        this.tempoDeExecucao = tempoDeExecucao;
    }

    setDeadline(deadline) {
        this.deadline = deadline;
    }
}

function controlFolderSistema() {
    sistemaFolder = gui.addFolder('Sistema');
    var objetoSistema = { Quantum: 0, Sobrecarga: 0 }
    sistemaFolder.add(objetoSistema, 'Quantum', LIMITE_INFERIOR, LIMITE_SUPERIOR, 1).onChange((value) => { sistema.setQuantum(value); })
    sistemaFolder.add(objetoSistema, 'Sobrecarga', LIMITE_INFERIOR, LIMITE_SUPERIOR, 1).onChange((value) => { sistema.setSobrecarga(value); })
    sistemaFolder.open()
}

function controlFolderProcessos() {
    processosFolder = gui.addFolder('Processos');
    var processos = { 'Adiciona Processo': addProcesso, 'Remove Processo': removeProcesso };
    processosFolder.add(processos, 'Adiciona Processo').onChange();
    processosFolder.add(processos, 'Remove Processo').onChange();
    processosFolder.open()
}

function controlAlgoritmosFolder() {
    algoritmosFolder = gui.addFolder('Algoritmos de Escalonamento');
    var entradaVazia = { Algoritmo: '' };
    const algoritmosDeEscalonamento = ['FIFO', 'Round-Robin', 'EDF', 'SJF'];
    algoritmosFolder.add(entradaVazia, 'Algoritmo').options(algoritmosDeEscalonamento)
        .onChange((value) => executaAlgoritmoDeEscalonamento(value, listaDeProcessos))
    algoritmosFolder.open()
}

function controlIniciarFolder() {
    iniciarProcessosFolder = gui.addFolder('Iniciar');
    var iniciarProcessos = { Run: iniciar };
    iniciarProcessosFolder.add(iniciarProcessos, 'Run')
    iniciarProcessosFolder.open()
}

function init() {
    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(new THREE.Color(0.0, 0.0, 0.0));

    controlFolderSistema();
    controlFolderProcessos();
    controlAlgoritmosFolder();
    controlIniciarFolder();

    const element = document.getElementById('canvas-three')
    const width = 900;
    const height = 500;

    renderer.setSize(width, height);

    element.appendChild(renderer.domElement);

    scene = new THREE.Scene();

    camera = new THREE.OrthographicCamera(width / -100, width / 2, height / 2, height / -50, width / height, 0);
    scene.add(camera);

    axesHelper = new THREE.AxesHelper(10000);

    scene.add(axesHelper);
};

function addProcesso() {
    quantidadeDeProcessos++;
    var processoCorrenteController = processosFolder.addFolder('Processo ' + quantidadeDeProcessos);
    var processoVariaveis = { 'Tempo de Chegada': 0, 'Tempo de Execução': 0, 'Deadline': 0 }
    const processoCorrente = new ProcessoInput()
    processoCorrenteController.add(processoVariaveis, 'Tempo de Chegada', LIMITE_INFERIOR, LIMITE_SUPERIOR, 1)
        .onChange((value) => { processoCorrente.setTempoDeChegada(value) });
    processoCorrenteController.add(processoVariaveis, 'Tempo de Execução', LIMITE_INFERIOR, LIMITE_SUPERIOR, 1)
        .onChange((value) => { processoCorrente.setTempoDeExecucao(value) });
    processoCorrenteController.add(processoVariaveis, 'Deadline', LIMITE_INFERIOR, LIMITE_SUPERIOR, 1)
        .onChange((value) => { processoCorrente.setDeadline(value) });
    listaDeProcessos.push(processoCorrente)
}

function removeProcesso() {
    console.log(quantidadeDeProcessos)
    if (quantidadeDeProcessos > 0) {
        processosFolder.removeFolder(gui.__folders.Processos.__folders['Processo ' + quantidadeDeProcessos])
        listaDeProcessos.pop()
        quantidadeDeProcessos--;
    }
}

function executaAlgoritmoDeEscalonamento(value) {
    if (value == "FIFO") {
        console.log("FIFO")
    }
    if (value == "Round-Robin") {
        console.log("Round-Robin")
    }
    if (value == "EDF") {
        console.log("EDF")
    }
    if (value == "SJF") {
        console.log("SJF")
    }
}

function iniciar() {
    render()
}

function render() {
    if (listaDeProcessos.length > 0) {
        console.log(listaDeProcessos)
        renderer.render(scene, camera);
    }
}

init();
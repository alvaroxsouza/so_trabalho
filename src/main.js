import * as THREE from '../node_modules/three/build/three.module.js';
import { GUI } from '../node_modules/dat.gui/build/dat.gui.module.js';

const LIMITE_SUPERIOR = 100;
const LIMITE_INFERIOR = 0;

const gui = new GUI({ name: "Escalonamento", width: 500 })

let scene, renderer, camera, axesHelper;
var speedAnimation = 0.001;

/* Pastas do GUI */
let sistemaFolder, processosFolder, iniciarProcessosFolder, algoritmosFolder;

const listaDeProcessos = [];
let quantidadeDeProcessos = 0;

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

const sistema = new SistemaInput();

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
    let objetoSistema = { Quantum: 0, Sobrecarga: 0 }
    sistemaFolder.add(objetoSistema, 'Quantum', LIMITE_INFERIOR, LIMITE_SUPERIOR, 1).onChange((value) => { sistema.setQuantum(value); })
    sistemaFolder.add(objetoSistema, 'Sobrecarga', LIMITE_INFERIOR, LIMITE_SUPERIOR, 1).onChange((value) => { sistema.setSobrecarga(value); })
    sistemaFolder.open()
}

function controlFolderProcessos() {
    processosFolder = gui.addFolder('Processos');
    let processos = { 'Adiciona Processo': addProcesso, 'Remove Processo': removeProcesso };
    processosFolder.add(processos, 'Adiciona Processo').onChange();
    processosFolder.add(processos, 'Remove Processo').onChange();
    processosFolder.open()
}

function controlAlgoritmosFolder() {
    algoritmosFolder = gui.addFolder('Algoritmos de Escalonamento');
    let entradaVazia = { Algoritmo: '' };
    const algoritmosDeEscalonamento = ['FIFO', 'Round-Robin', 'EDF', 'SJF'];
    algoritmosFolder.add(entradaVazia, 'Algoritmo').options(algoritmosDeEscalonamento)
        .onChange((value) => executaAlgoritmoDeEscalonamento(value, listaDeProcessos))
    algoritmosFolder.open()
}

function controlIniciarFolder() {
    iniciarProcessosFolder = gui.addFolder('Iniciar');
    let iniciarProcessos = { Run: iniciar, 'Velocidade da animação': 0 };
    iniciarProcessosFolder.add(iniciarProcessos, 'Run')
    iniciarProcessosFolder.add(iniciarProcessos, 'Velocidade da animação', 0.0001, 0.001, 0.000001)
        .onChange((value) => { speedAnimation += value })
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

    // camera = new THREE.OrthographicCamera(width / -100, width / 2, height / 2, height / -50, width / height, 0);
    camera = new THREE.OrthographicCamera(-50, 50, 50, -50, 50 / 50, 0);
    scene.add(camera);

    axesHelper = new THREE.AxesHelper(10000);

    scene.add(axesHelper);
};

function addProcesso() {
    quantidadeDeProcessos++;
    let processoCorrenteController = processosFolder.addFolder('Processo ' + quantidadeDeProcessos);
    let processoVariaveis = { 'Tempo de Chegada': 0, 'Tempo de Execução': 0, 'Deadline': 0 }
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
    switch (value) {
        case "FIFO":
            console.log("FIFO")
            break;
        case "Round-Robin":
            console.log("Round-Robin")
            break;
        case "EDF":
            console.log("EDF")
            break;
        case "SJF":
            console.log("SJF")
            break;
        default:
            alert("Erro, escolha um algoritmo de escalonamento válido");
            break;
    }
}
var speed = 0;

function desenhaExecucaoDeProcesso() {
    speed += speedAnimation;
    const verticesTriangulo = []
    verticesTriangulo.push(0.0, 0.0, 0.0)
    verticesTriangulo.push(speed, 0.0, 0.0)
    verticesTriangulo.push(speed, 10.0, 0.0)

    verticesTriangulo.push(speed, 10.0, 0.0)
    verticesTriangulo.push(0.0, 10.0, 0.0)
    verticesTriangulo.push(0.0, 0.0, 0.0)

    const geometry = new THREE.BufferGeometry()

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(verticesTriangulo, 3));

    const material = new THREE.MeshBasicMaterial({
        color: 0x00ff00,
        wireframe: false
    });
    const triangulo = new THREE.Mesh(geometry, material);

    triangulo.translateX(0.0)
    triangulo.translateY(0.0)
    scene.add(triangulo);
}

function desenhaProcesso() {
    speed += speedAnimation;
    const verticesTriangulo = []
    verticesTriangulo.push(10 + 0.0, 10.0, 0.0)
    verticesTriangulo.push(10 + speed, 10.0, 0.0)
    verticesTriangulo.push(10 + speed, 20.0, 0.0)

    verticesTriangulo.push(10 + speed, 20.0, 0.0)
    verticesTriangulo.push(10 + 0.0, 20.0, 0.0)
    verticesTriangulo.push(10 + 0.0, 10.0, 0.0)

    const geometry = new THREE.BufferGeometry()

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(verticesTriangulo, 3));

    const material = new THREE.MeshBasicMaterial({
        color: 0x00ff00,
        wireframe: false
    });
    const triangulo = new THREE.Mesh(geometry, material);

    /* triangulo.translateX(10.0)
    triangulo.translateY(10.0) */
    scene.add(triangulo);
}

function iniciar() {
    render()
}

function render() {
    requestAnimationFrame(render);
    desenhaExecucaoDeProcesso();
    desenhaProcesso();
    renderer.render(scene, camera);
    desenhaExecucaoDeProcesso();
}

init();
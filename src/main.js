import * as THREE from '../node_modules/three/build/three.module.js';
import { GUI } from '../node_modules/dat.gui/build/dat.gui.module.js';

const LIMITE_SUPERIOR = 100;
const LIMITE_INFERIOR = 0;

const gui = new GUI({ name: "Escalonamento", width: 500 })

/* Configurações da renderização */
let scene, renderer, camera, axesHelper, escala;
var speedAnimation = 0.001;
let speed = 0.0;

const ESPAÇO_ESQUERDA = -40;
const ESPAÇO_BAIXO = -40;

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
    sistemaFolder.add(objetoSistema, 'Quantum', LIMITE_INFERIOR, LIMITE_SUPERIOR, 1)
        .onChange((value) => { sistema.setQuantum(value); })
    sistemaFolder.add(objetoSistema, 'Sobrecarga', LIMITE_INFERIOR, LIMITE_SUPERIOR, 1)
        .onChange((value) => { sistema.setSobrecarga(value); })
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
    let iniciarProcessos = { Inicia: iniciar, 'Reinicia': reiniciarCena, 'Velocidade da animação': 0 };
    iniciarProcessosFolder.add(iniciarProcessos, 'Inicia')
    iniciarProcessosFolder.add(iniciarProcessos, 'Reinicia')
    iniciarProcessosFolder.add(iniciarProcessos, 'Velocidade da animação', 0.0001, 0.001, 0.000001)
        .onChange((value) => { speedAnimation += value })
    iniciarProcessosFolder.open()
}

function init() {
    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(new THREE.Color(0.0, 0.0, 0.0));
    const element = document.getElementById('canvas-three')
    element.appendChild(renderer.domElement);

    controlFolderSistema();
    controlFolderProcessos();
    controlAlgoritmosFolder();
    controlIniciarFolder();


    scene = new THREE.Scene();

    const width = 900;
    const height = 500;

    renderer.setSize(width, height);

    // camera = new THREE.OrthographicCamera(width / -100, width / 2, height / 2, height / -50, width / height, 0);
    camera = new THREE.OrthographicCamera(ESPAÇO_ESQUERDA, width + ESPAÇO_ESQUERDA, height + ESPAÇO_BAIXO, ESPAÇO_BAIXO,
        width / height, 0);
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

function desenhaExecucaoDeProcesso(numeroDoProcesso = 2, tempoInicial = 10, tempoFinal = 10) {
    speed += speedAnimation;
    if (speed <= tempoFinal) {
        const tamanhoDoRetangulo = 10;
        const quantidadeDeAlturaDosRetangulos = 10;

        const posicaoInicialX = tempoInicial;
        const posicaoMinY = numeroDoProcesso * tamanhoDoRetangulo;
        const posicaoMaxY = numeroDoProcesso * tamanhoDoRetangulo + quantidadeDeAlturaDosRetangulos;

        const verticesTriangulo = []

        verticesTriangulo.push(posicaoInicialX, posicaoMinY, 0.0);
        verticesTriangulo.push(speed, posicaoMinY, 0.0);
        verticesTriangulo.push(speed, posicaoMaxY, 0.0);

        verticesTriangulo.push(speed, posicaoMaxY, 0.0);
        verticesTriangulo.push(posicaoInicialX, posicaoMaxY, 0.0);
        verticesTriangulo.push(posicaoInicialX, posicaoMinY, 0.0);

        const geometry = new THREE.BufferGeometry();

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(verticesTriangulo, 3));

        const material = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            wireframe: false
        });
        const triangulo = new THREE.Mesh(geometry, material);

        scene.add(triangulo);
    }
}

function iniciar() {
    render()
}

function reiniciarCena() {
    if (scene.children.length > 2) {
        for (let i = scene.children.length - 1; i >= 2; i--) {
            scene.remove(scene.children[i]);
        }
    }
    speed = 0.0;
}

function render() {
    requestAnimationFrame(render);
    if (listaDeProcessos.length > 0) {
        console.log(listaDeProcessos.length);
        for (let i = 0; i < listaDeProcessos.length; i++) {
            const processo = listaDeProcessos[i];
            desenhaExecucaoDeProcesso(i, processo.tempoDeChegada, processo.tempoDeExecucao);
        }
    }
    renderer.render(scene, camera);
}

init();
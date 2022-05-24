import * as THREE from '../node_modules/three/build/three.module.js';
// import { TextGeometry } from 'examples/jsm/geometries/TextGeometry';
// import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { GUI } from '../node_modules/dat.gui/build/dat.gui.module.js';
import { listaDeProcessosFIFO } from './FIFO.js';
import { Processo } from './Processo.js';

const LIMITE_SUPERIOR = 1000;
const LIMITE_INFERIOR = 0;

const gui = new GUI({ name: "Escalonamento", width: 400 })

/* Configurações da renderização */
let scene, renderer, camera, axesHelper, escala;
var speedAnimation = 0.001;
let speed = 0.1;

let listaDeRetangulos = []

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
/* class ProcessoInput {
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
} */

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
    iniciarProcessosFolder.add(iniciarProcessos, 'Velocidade da animação', LIMITE_INFERIOR, LIMITE_SUPERIOR, 1)
        .onChange((value) => { speedAnimation += value })
    iniciarProcessosFolder.open()
}

function addProcesso() {
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

function removeProcesso() {
    if (quantidadeDeProcessos > 0) {
        processosFolder.removeFolder(gui.__folders.Processos.__folders['Processo ' + quantidadeDeProcessos])
        listaDeProcessos.pop()
        quantidadeDeProcessos--;
    }
}

function executaAlgoritmoDeEscalonamento(value) {
    switch (value) {
        case "FIFO":
            if (listaDeProcessos.length > 0) {
                listaDeRetangulos = listaDeProcessosFIFO(listaDeProcessos);
            }
            break;
        case "Round-Robin":
            break;
        case "EDF":
            break;
        case "SJF":
            break;
        default:
            alert("Erro, escolha um algoritmo de escalonamento válido");
            break;
    }
}

function desenhaExecucaoDeProcesso(numeroDoProcesso = 0, tempoInicial = 0, tempoFinal = 0) {
    speed += speedAnimation / 100000;
    if (speed <= tempoFinal) {
        const tamanhoDoRetangulo = 10;
        const quantidadeDeAlturaDosRetangulos = 10;

        const posicaoInicialX = tempoInicial;
        const posicaoMinY = numeroDoProcesso * tamanhoDoRetangulo;
        const posicaoMaxY = numeroDoProcesso * tamanhoDoRetangulo + quantidadeDeAlturaDosRetangulos;

        const verticesTriangulo = [];

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

function desenhaSobrecargaDeProcesso(sobrecarga = 0, ultimoProcessoPosicaoX = 0, ultimoProcessoPosicaoY = 0) {
    speed += speedAnimation;
    if (speed <= tempoFinal) {
        const tamanhoDoRetangulo = 10;
        const quantidadeDeAlturaDosRetangulos = 10;

        const posicaoInicialX = ultimoProcessoPosicaoX;
        const posicaoMinY = numeroDoProcesso * tamanhoDoRetangulo;
        const posicaoMaxY = numeroDoProcesso * tamanhoDoRetangulo + quantidadeDeAlturaDosRetangulos;

        const verticesTriangulo = [];

        verticesTriangulo.push(posicaoInicialX, posicaoMinY, 0.0);
        verticesTriangulo.push(speed, posicaoMinY, 0.0);
        verticesTriangulo.push(speed, posicaoMaxY, 0.0);
        verticesTriangulo.push(speed, posicaoMaxY, 0.0);
        verticesTriangulo.push(posicaoInicialX, posicaoMaxY, 0.0);
        verticesTriangulo.push(posicaoInicialX, posicaoMinY, 0.0);

        const geometry = new THREE.BufferGeometry();

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(verticesTriangulo, 3));

        const material = new THREE.MeshBasicMaterial({
            color: 0xFF0000,
            wireframe: false
        });
        const triangulo = new THREE.Mesh(geometry, material);

        scene.add(triangulo);
    }
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

    listaDeRetangulos.forEach((retangulo) => {
        desenhaExecucaoDeProcesso(retangulo.id, retangulo.tempoInicial, retangulo.tempoFinal)
    })

    const fontJson = require("../node_modules/three/examples/fonts/gentilis_regular.typeface.json");

    const font = new THREE.Font(fontJson);

    const geometry = new TextGeometry('Hello three.js!', {
        font: font,
        size: 80,
        height: 5,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 10,
        bevelSize: 8,
        bevelOffset: 0,
        bevelSegments: 5
    });

    materials = [
        new THREE.MeshPhongMaterial({ color: 0xffffff, flatShading: true }), // front
        new THREE.MeshPhongMaterial({ color: 0xffffff }) // side
    ];

    const texto = new THREE.Mesh(geometry, )

    renderer.render(scene, camera);
}

function iniciar() { render(); }

function iniciarCena() {
    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(new THREE.Color(1.0, 1.0, 1.0));
    const element = document.getElementById('canvas-three')
    element.appendChild(renderer.domElement);

    const width = 900;
    const height = 500;
    renderer.setSize(width, height);
    camera = new THREE.OrthographicCamera(ESPAÇO_ESQUERDA, width + ESPAÇO_ESQUERDA, height + ESPAÇO_BAIXO, ESPAÇO_BAIXO,
        width / height, 0);
    scene = new THREE.Scene();
    axesHelper = new THREE.AxesHelper(10000);
    axesHelper.setColors(new THREE.Color(0.0, 0.0, 0.0), new THREE.Color(0.0, 0.0, 0.0))
    scene.add(camera);
    scene.add(axesHelper);
}

function init() {
    controlFolderSistema();
    controlFolderProcessos();
    controlAlgoritmosFolder();
    controlIniciarFolder();
    iniciarCena();
}

init();
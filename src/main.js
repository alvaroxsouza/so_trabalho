import * as THREE from 'three';
import { FontLoader } from 'FontLoader';
import { TextGeometry } from 'TextGeometry';
import { GUI } from 'GUI';
import { PointerLockControls } from 'PointerLockControls';
import { listaDeProcessosFIFO } from './FIFO.js';
import { Processo } from './Processo.js';
import { SistemaInput } from './SistemaInput.js';
import { findavgTimeSJF } from './SJF.js';
import { findavgTimeRR } from './RR.js';
import { findavgTimeEDF } from './EDF.js';

const LIMITE_SUPERIOR = 1000;
const LIMITE_INFERIOR = 0;

const LARGURA = 1200;
const ALTURA = 600;

const gui = new GUI({ name: "Escalonamento", width: 200 })

/* Configurações da renderização */
let scene, renderer, camera, axesHelper, controleDaCamera;
let podeEscrever = false,
    flag = false;
var velocidadeDaAnimacao = 0.001;
let velocidadeAnimacaoAnterior = 0;
let velocidadeAtual = 0.1;

let listaDeRetangulos = []
let quantidadeDeProcessos = 0;
const listaDeProcessos = [];
let turnAround = 0;
let waitingTime = 0;
const sistema = new SistemaInput();

/* Pastas do GUI */
let sistemaFolder, processosFolder, iniciarProcessosFolder, algoritmosFolder;


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
    let iniciarProcessos = { Inicia: iniciar, 'Velocidade da animação': 0 };
    iniciarProcessosFolder.add(iniciarProcessos, 'Inicia');
    let valorAnterior = 0;
    iniciarProcessosFolder.add(iniciarProcessos, 'Velocidade da animação', LIMITE_INFERIOR, LIMITE_SUPERIOR, 1)
        .onChange((value) => {
            velocidadeDaAnimacao = value;
        });
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
        .onChange((value) => {
            processoCorrente.setTempoDeExecucao(value);
            processoCorrente.setTempoDeExecucaoAtual(value);
        });
    processoCorrenteController.add(processoVariaveis, 'Deadline', LIMITE_INFERIOR, LIMITE_SUPERIOR, 1)
        .onChange((value) => {
            processoCorrente.setDeadline(value + processoCorrente.getTempoDeChegada(value));
        });
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
            if (listaDeProcessos.length > 0) {
                let obj = findavgTimeRR(listaDeProcessos, sistema.getQuantum(), sistema.getSobrecarga());
                listaDeRetangulos = obj.listaDeRetangulos;
                turnAround = obj.Tat;
                waitingTime = obj.Wt;
            }
            break;
        case "EDF":
            if (listaDeProcessos.length > 0) {
                let obj = findavgTimeEDF(listaDeProcessos, sistema.getQuantum(), sistema.getSobrecarga());
                listaDeRetangulos = obj.listaDeRetangulos;
                turnAround = obj.Tat;
                waitingTime = obj.Wt;
            }
            break;
        case "SJF":
            if (listaDeProcessos.length > 0) {
                let obj = findavgTimeSJF(listaDeProcessos);
                listaDeRetangulos = obj.listaDeRetangulos;
                turnAround = obj.Tat;
                waitingTime = obj.Wt;
            }
            break;
        default:
            alert("Erro, escolha um algoritmo de escalonamento válido");
            break;
    }
}

function desenhaExecucaoDeProcesso(numeroDoProcesso = 0, tempoInicial = 0, tempoFinal = 0, color = 0x00ff00) {
    velocidadeAtual += (velocidadeDaAnimacao >= velocidadeAnimacaoAnterior) ? velocidadeDaAnimacao / 100000 : -(velocidadeDaAnimacao / 1000000);
    velocidadeAnimacaoAnterior = velocidadeDaAnimacao;

    if (velocidadeAtual <= tempoFinal) {
        const tamanhoDoRetangulo = 2;
        const quantidadeDeAlturaDosRetangulos = 2;

        const posicaoInicialX = tempoInicial;

        const posicaoMinY = Math.round(numeroDoProcesso * tamanhoDoRetangulo);
        const posicaoMaxY = Math.round(numeroDoProcesso * tamanhoDoRetangulo + quantidadeDeAlturaDosRetangulos);

        const verticesTriangulo = [];
        verticesTriangulo.push(posicaoInicialX, posicaoMinY, 0.0);
        verticesTriangulo.push(velocidadeAtual, posicaoMinY, 0.0);
        verticesTriangulo.push(velocidadeAtual, posicaoMaxY, 0.0);
        verticesTriangulo.push(velocidadeAtual, posicaoMaxY, 0.0);
        verticesTriangulo.push(posicaoInicialX, posicaoMaxY, 0.0);
        verticesTriangulo.push(posicaoInicialX, posicaoMinY, 0.0);

        const geometry = new THREE.BufferGeometry();

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(verticesTriangulo, 3));

        const material = new THREE.MeshBasicMaterial({
            color: color,
            wireframe: false
        });
        const triangulo = new THREE.Mesh(geometry, material);
        scene.add(triangulo);
    } else {
        const ultimoRetangulo = listaDeRetangulos[listaDeProcessos.length - 1];
        if (ultimoRetangulo && !flag) {
            if (tempoFinal == listaDeRetangulos[listaDeProcessos.length - 1].tempoFinal) {
                podeEscrever = true;
                flag = true;
            }
        }
    }
}

function mostrarTextoDeVariaveis(text = "", value, interval = 0) {
    const textoDeApresentacao = text + ": " + parseFloat(value);
    const loader = new FontLoader();
    let textMesh1 = new THREE.Mesh();
    loader.load('src/helvetiker_regular.typeface.json', function(font) {
        const textGeo = new TextGeometry(textoDeApresentacao, {
            font: font,
            size: 0.5,
            height: 0.02,
            curveSegments: 12,
            bevelThickness: 0.1,
            bevelSize: 0.01,
            bevelEnabled: true
        });

        textGeo.computeBoundingBox();

        const materials = new THREE.MeshBasicMaterial({ color: 0xaa0000, wireframe: true });

        textMesh1.geometry = textGeo;
        textMesh1.material = materials;

        textMesh1.position.x = -4.7;
        textMesh1.position.y = 10 - interval;
    })

    scene.add(textMesh1);
}

function numeracaoDeEixos(value, interval) {
    const textoDeApresentacao = "" + value;
    const loader = new FontLoader();
    let textMesh1 = new THREE.Mesh();
    loader.load('src/helvetiker_regular.typeface.json', function(font) {
        const textGeo = new TextGeometry(textoDeApresentacao, {
            font: font,
            size: 0.4,
            height: 0.001,
            curveSegments: 12,
            bevelThickness: 0.1,
            bevelSize: 0.001,
            bevelEnabled: true
        });

        textGeo.computeBoundingBox();

        const materials = new THREE.MeshBasicMaterial({ color: 0xaa0000, wireframe: true });

        textMesh1.geometry = textGeo;
        textMesh1.material = materials;

        textMesh1.position.x = interval - 0.3;
        textMesh1.position.y = -0.7;
    })

    scene.add(textMesh1);
}

function render() {
    requestAnimationFrame(render);
    let i = 0;
    if (listaDeRetangulos) {
        listaDeRetangulos.forEach((retangulo) => {
            i++;
            if (retangulo) {
                console.log(retangulo)
                if (retangulo.isSobrecarga()) {
                    desenhaExecucaoDeProcesso(retangulo.id, retangulo.tempoInicial, retangulo.tempoFinal, 0xaa0000);
                } else if (retangulo.isDeadlineBool()) {
                    desenhaExecucaoDeProcesso(retangulo.id, retangulo.tempoInicial, retangulo.tempoFinal, 0xAAAAAA);
                } else {
                    desenhaExecucaoDeProcesso(retangulo.id, retangulo.tempoInicial, retangulo.tempoFinal);
                }
                if (podeEscrever) {
                    mostrarTextoDeVariaveis("TurnAround\n", turnAround.toFixed(2));
                    mostrarTextoDeVariaveis("Tempo \nde Espera", waitingTime.toFixed(2), 3);
                    podeEscrever = false;
                }
            }
        })
    }
    renderer.render(scene, camera);
}

function controle(event) {
    if (controleDaCamera) {
        console.log(controleDaCamera);
        if (event.code == 'KeyW') {
            controleDaCamera.moveForward(10);
        }
        if (event.code == 'KeyS') {
            controleDaCamera.moveForward(-10);
        }
        if (event.code == 'KeyA') {
            controleDaCamera.moveRight(-10);
        }
        if (event.code == 'KeyD') {
            controleDaCamera.moveRight(10);
        }
    }

}

function iniciar() {
    if (scene.children.length > 2) {
        for (let i = scene.children.length - 1; i >= 81; i--) {
            scene.remove(scene.children[i]);
            flag = false;
        }
    }
    render()
    velocidadeAtual = 0.0;
}

function iniciarCena() {
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setClearColor(new THREE.Color(1.0, 1.0, 1.0));
    const element = document.getElementById('canvas-three');
    element.appendChild(renderer.domElement);

    document.addEventListener('keydown', controle, false);

    const ESQUERDA_CAMERA = -5;
    const DIREITA_CAMERA = 30;
    const CIMA_CAMERA = 40;
    const BAIXO_CAMERA = -1;
    const width = LARGURA;
    const height = ALTURA;

    camera = new THREE.OrthographicCamera(ESQUERDA_CAMERA, DIREITA_CAMERA, CIMA_CAMERA, BAIXO_CAMERA, width / height, 0);
    controleDaCamera = new PointerLockControls(camera, renderer.domElement);

    /* if (controleDaCamera) {
        element.addEventListener(
            'click',
            function() {
                controleDaCamera.lock()
            }, false
        )
    } */
    renderer.setSize(width, height);
    scene = new THREE.Scene();

    let numeroEixo = 0;
    for (let i = 0; i < 40; i += 1) {
        axesHelper = new THREE.AxesHelper(1000);
        axesHelper.setColors(new THREE.Color(0.0, 0.0, 0.0), new THREE.Color(0.0, 0.0, 0.0));
        axesHelper.position.x = i;
        numeracaoDeEixos(i, numeroEixo)
        scene.add(axesHelper);
        numeroEixo++;
    }

    console.log(scene);
    scene.add(camera);
    renderer.render(scene, camera);
}

function init() {
    controlFolderSistema();
    controlFolderProcessos();
    controlAlgoritmosFolder();
    controlIniciarFolder();
    iniciarCena();
}

init();
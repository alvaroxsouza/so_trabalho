import * as THREE from 'three';
import { FontLoader } from 'FontLoader';
import { TextGeometry } from 'TextGeometry';
import { GUI } from 'GUI';
import { PointerLockControls } from 'PointerLockControls';
import { Processo } from './pagina2/Processo.js';
import { SistemaInput } from './SistemaInput.js';
import { findTurnAroundTimeFIFO } from './pagina2/FIFO.js';
import { findavgTimeSJF } from './pagina2/SJF.js';
import { findavgTimeRR } from './pagina2/RR.js';
import { findavgTimeEDF } from './pagina2/EDF.js';
import { criaRetangulo, mudaGeometria } from './RetanguloObjetoGrafico.js';

const LIMITE_SUPERIOR = 1000;
const LIMITE_INFERIOR = 0;
const NUMERO_MAXIMO_TEMPO = 100;

const LARGURA = 1000;
const ALTURA = 500;

const ESQUERDA_CAMERA = -5;
const DIREITA_CAMERA = 30;
const CIMA_CAMERA = 40;
const BAIXO_CAMERA = -1;

const gui = new GUI({ name: "Escalonamento", width: 300 });

/* Configurações da renderização */
let scene, renderer, camera, axesHelper, controleDaCamera;
let turnAroundGrafico, waitingTimeGrafico;
let podeEscrever = false,
    flag = false;
let listaDeRetangulosGraficos = [];
let velocidadeDaAnimacao = 0.001;
let velocidadeAnimacaoAnterior = 0;
let velocidadeAtual = 0.1;
let algoritmoOption;
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
        .onChange((value) => {
            algoritmoOption = value;
        })
    algoritmosFolder.open()
}

function controlIniciarFolder() {
    iniciarProcessosFolder = gui.addFolder('Iniciar');
    let iniciarProcessos = { Inicia: iniciar, 'Velocidade da animação': 0 };
    iniciarProcessosFolder.add(iniciarProcessos, 'Inicia');
    iniciarProcessosFolder.add(iniciarProcessos, 'Velocidade da animação', LIMITE_INFERIOR, LIMITE_SUPERIOR, 1)
        .onChange((value) => {
            velocidadeDaAnimacao = value;
        });
    iniciarProcessosFolder.open()
}

function addProcesso() {
    quantidadeDeProcessos++;
    let processoCorrenteController = processosFolder.addFolder('Processo ' + quantidadeDeProcessos);
    let processoVariaveis = { 'Tempo de Chegada': 0, 'Tempo de Execução': 0, 'Deadline': 0, 'Páginas': "" }
    const processoCorrente = new Processo(quantidadeDeProcessos)
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
    processoCorrenteController.add(processoVariaveis, 'Páginas')
        .onChange((value) => {
            processoCorrente.setPaginas(value);
            processoCorrente.posicoesPaginas = new Array(processoCorrente.paginas.length).fill("-1");
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

function iniciaRetangulos(listaDeRetangulos) {
    listaDeRetangulos.forEach(r => {
        let ret;
        if (r.isSobrecarga() || r.isSobrecarga() && r.isSobrecarga()) {
            ret = criaRetangulo(0.0, 0.0, 0.0, 0xaa0000);
        } else if (r.isDeadlineBool() && !r.isSobrecarga()) {
            ret = criaRetangulo(0.0, 0.0, 0.0, 0xAAAAAA);
        } else {
            ret = criaRetangulo(0.0, 0.0, 0.0);
        }
        listaDeRetangulosGraficos.push(ret);
    })
}

function remapeamentoDeProcesso(listaDeProcessos) {
    let newList = [];
    for (let i = 0; i < listaDeProcessos.length; i++) {
        let processo = listaDeProcessos[i];
        newList.push(new Processo(processo.getId(), processo.getTempoDeChegada(), processo.getTempoDeExecucao(), processo.getDeadline(), processo.getPaginas()));
    }
    return newList;
    /* return listaDeProcessos.map((processo) => {
        processo = 
        console.log(processo);
        return processo;
    }) */
}

function executaAlgoritmoDeEscalonamento(value) {
    switch (value) {
        case "FIFO":
            if (listaDeProcessos.length > 0) {
                let newlist = remapeamentoDeProcesso(listaDeProcessos);
                let obj = findTurnAroundTimeFIFO(newlist, sistema.getQuantum(), sistema.getSobrecarga());
                listaDeRetangulos = obj.listaDeRetangulos;
                turnAround = obj.Tat;
                waitingTime = obj.Wt;
            }
            if (listaDeRetangulos) {
                iniciaRetangulos(listaDeRetangulos, listaDeRetangulosGraficos);
            }
            break;
        case "Round-Robin":
            if (listaDeProcessos.length > 0) {
                let newlist = remapeamentoDeProcesso(listaDeProcessos);
                let obj = findavgTimeRR(newlist, sistema.getQuantum(), sistema.getSobrecarga());
                listaDeRetangulos = obj.listaDeRetangulos;
                turnAround = obj.Tat;
                waitingTime = obj.Wt;
            }
            if (listaDeRetangulos) {
                iniciaRetangulos(listaDeRetangulos, listaDeRetangulosGraficos);
            }
            break;
        case "EDF":
            if (listaDeProcessos.length > 0) {
                /* console.log(listaDeProcessos);
                let newlist = remapeamentoDeProcesso(listaDeProcessos);
                console.log(newlist) */
                let obj = findavgTimeEDF(listaDeProcessos, sistema.getQuantum(), sistema.getSobrecarga());
                listaDeRetangulos = obj.listaDeRetangulos;
                console.log(listaDeRetangulos)
                turnAround = obj.Tat;
                waitingTime = obj.Wt;
            }
            if (listaDeRetangulos) {
                iniciaRetangulos(listaDeRetangulos, listaDeRetangulosGraficos);
            }
            break;
        case "SJF":
            if (listaDeProcessos.length > 0) {
                let newlist = remapeamentoDeProcesso(listaDeProcessos);
                let obj = findavgTimeSJF(newlist, sistema.getQuantum(), sistema.getSobrecarga());
                listaDeRetangulos = obj.listaDeRetangulos;
                turnAround = obj.Tat;
                waitingTime = obj.Wt;
            }
            if (listaDeRetangulos) {
                iniciaRetangulos(listaDeRetangulos, listaDeRetangulosGraficos);
            }
            break;
    }
}

function mostrarTextoDeVariaveis(text = "", value, interval = 0) {
    const textoDeApresentacao = text + ": " + parseFloat(value);
    const loader = new FontLoader();
    let textMesh1 = new THREE.Mesh();
    loader.load('src/helvetiker_regular.typeface.json', function(font) {
        const textGeo = new TextGeometry(textoDeApresentacao, {
            font: font,
            size: 0.55,
            height: 0.001,
            curveSegments: 20,
            bevelThickness: 0.2,
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

    return textMesh1;
}

function desenhaExecucaoDeProcesso(retanguloMudanca, numeroDoProcesso = 0, tempoInicial = 0, tempoFinal = 0, color = 0x00ff00) {
    velocidadeAtual += (velocidadeDaAnimacao >= velocidadeAnimacaoAnterior) ? velocidadeDaAnimacao / 10000 : -(velocidadeDaAnimacao / 10000);
    velocidadeAnimacaoAnterior = velocidadeDaAnimacao;

    const tamanhoDoRetangulo = 2;
    const quantidadeDeAlturaDosRetangulos = 2;
    const posicaoInicialX = tempoInicial;
    const posicaoMinY = Math.round(numeroDoProcesso * tamanhoDoRetangulo);
    const posicaoMaxY = Math.round(numeroDoProcesso * tamanhoDoRetangulo + quantidadeDeAlturaDosRetangulos);

    if (velocidadeAtual <= tempoFinal) {
        mudaGeometria(retanguloMudanca, posicaoInicialX, velocidadeAtual, posicaoMinY, posicaoMaxY, color);
    } else {
        const ultimoRetangulo = listaDeRetangulos[listaDeRetangulos.length - 1];
        if (ultimoRetangulo && !flag) {
            if (tempoFinal == listaDeRetangulos[listaDeRetangulos.length - 1].tempoFinal) {
                podeEscrever = true;
                flag = true;
            }
        }
        mudaGeometria(retanguloMudanca, tempoInicial, tempoFinal, posicaoMinY, posicaoMaxY, color);
    }
}

function numeracaoDeEixos(value, interval) {
    const textoDeApresentacao = "" + value;
    const loader = new FontLoader();
    const color = 0xFFd700
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

    return textMesh1;
}

function iniciarCena() {
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setClearColor(new THREE.Color(1.0, 1.0, 1.0));

    const element = document.getElementById('canvas-three');

    element.appendChild(renderer.domElement);

    renderer.setSize(LARGURA, ALTURA);

    document.addEventListener('keydown', controle, false);

    camera = new THREE.OrthographicCamera(ESQUERDA_CAMERA, DIREITA_CAMERA, CIMA_CAMERA, BAIXO_CAMERA, LARGURA / ALTURA, 0);
    controleDaCamera = new PointerLockControls(camera, renderer.domElement);

    if (controleDaCamera) {
        element.addEventListener(
            'click',
            function() {
                controleDaCamera.unlock();
            }, false
        )
    }
    renderer.setSize(LARGURA, ALTURA);
    scene = new THREE.Scene();



    let numeroEixo = 0;
    for (let i = 0; i < NUMERO_MAXIMO_TEMPO; i++) {
        axesHelper = new THREE.AxesHelper(100);
        axesHelper.setColors(new THREE.Color(0.0, 0.0, 0.0), new THREE.Color(0.0, 0.0, 0.0));
        axesHelper.position.x = i;
        scene.add(axesHelper);
        scene.add(numeracaoDeEixos(i, numeroEixo));
        numeroEixo++;
    }
    renderer.render(scene, camera);
    limparCena()
}

function render() {
    requestAnimationFrame(render);
    for (let i = 0; i < listaDeRetangulosGraficos.length; i++) {
        let retangulo = listaDeRetangulos[i];
        let retanguloGrafico = listaDeRetangulosGraficos[i];
        if (retangulo) {
            if (retangulo.isSobrecarga()) {
                desenhaExecucaoDeProcesso(retanguloGrafico, retangulo.id, retangulo.tempoInicial, retangulo.tempoFinal, 0xaa0000);
            } else if (retangulo.isDeadlineBool()) {
                desenhaExecucaoDeProcesso(retanguloGrafico, retangulo.id, retangulo.tempoInicial, retangulo.tempoFinal, 0xAAAAAA);
            } else {
                desenhaExecucaoDeProcesso(retanguloGrafico, retangulo.id, retangulo.tempoInicial, retangulo.tempoFinal, 0x00FF00);
            }
            if (podeEscrever) {
                if (turnAroundGrafico) {
                    console.log("Entrou aqui 1")
                    scene.remove(turnAroundGrafico);
                }
                if (waitingTimeGrafico) {
                    console.log("Entrou aqui 2")
                    scene.remove(waitingTimeGrafico);
                }
                turnAroundGrafico = mostrarTextoDeVariaveis("TurnAround\n", turnAround.toFixed(2));
                scene.add(turnAroundGrafico);
                waitingTimeGrafico = mostrarTextoDeVariaveis("Tempo \nde Espera", waitingTime.toFixed(2), 3);
                scene.add(waitingTimeGrafico);
                velocidadeAtual += 0.0;
                podeEscrever = false;
            }
            scene.add(retanguloGrafico);
        }
    }
    renderer.render(scene, camera);
}

function controle(event) {
    if (controleDaCamera) {
        if (event.code == 'KeyW') {
            camera.position.y += 5;
        }
        if (event.code == 'KeyS') {
            if (camera.position.y > -5) {
                camera.position.y -= 5;
            }
        }
        if (event.code == 'KeyA') {
            if (camera.position.x > -5) {
                camera.position.x -= 5;
            }
        }
        if (event.code == 'KeyD') {
            camera.position.x += 5;
        }
        camera.updateProjectionMatrix()
    }
}

function limparCena() {
    if (scene.children.length > 201) {
        for (let i = scene.children.length - 1; i >= 201; i--) {
            scene.remove(scene.children[i]);
            flag = false;
        }
    }
}

function iniciar() {
    limparCena();
    executaAlgoritmoDeEscalonamento(algoritmoOption, listaDeProcessos);
    velocidadeAtual = 0.0;
    render();
}

function init() {
    controlFolderSistema();
    controlFolderProcessos();
    controlAlgoritmosFolder();
    controlIniciarFolder();
    iniciarCena();
}

init();
import * as THREE from 'three';
import { FontLoader } from 'FontLoader';
import { TextGeometry } from 'TextGeometry';
import { GUI } from 'GUI';
import { PointerLockControls } from 'PointerLockControls';
import { Processo } from './Processo.js';
import { SistemaInput } from './SistemaInput.js';
import { findTurnAroundTimeFIFO } from './FIFO.js';
import { findavgTimeSJF } from './SJF.js';
import { findavgTimeRR } from './RR.js';
import { findavgTimeEDF } from './EDF.js';
import { criaRetangulo, mudaGeometria } from './RetanguloObjetoGrafico.js';

const LIMITE_SUPERIOR = 1000;
const LIMITE_INFERIOR = 0;
const NUMERO_MAXIMO_TEMPO = 100;

const LARGURA = 1000;
const ALTURA = 500;

const ESQUERDA_CAMERA = -5;
const DIREITA_CAMERA = 30;
const CIMA_CAMERA = 40;
const BAIXO_CAMERA = -10;

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
let listaDeRetangulos = [];
let listaDeIdentificadoresGraficos = [];
let quantidadeDeProcessos = 0;
const listaDeProcessos = [];
let turnAround = 0;
let waitingTime = 0;
const sistema = new SistemaInput();

/* Pastas do GUI */
let sistemaFolder, processosFolder, iniciarProcessosFolder, algoritmosFolder;

/*
Faz a gestão de controle da pasta do sistema, fazendo a criação do objeto Sistema que contém dois atributos
importantes para os algoritmos de escalonamento, que é a Sobrecarga e o Quantum. Com essas duas informações,
cria um Objeto do tipo Sistema e passa essa informaçãao para a aplicação poder fazer o uso posteriormente.
 */
function controlFolderSistema() {
    sistemaFolder = gui.addFolder('Sistema');
    let objetoSistema = { Quantum: 0, Sobrecarga: 0 }
    sistemaFolder.add(objetoSistema, 'Quantum', LIMITE_INFERIOR, LIMITE_SUPERIOR, 1)
        .onChange((value) => { sistema.setQuantum(value); })
    sistemaFolder.add(objetoSistema, 'Sobrecarga', LIMITE_INFERIOR, LIMITE_SUPERIOR, 1)
        .onChange((value) => { sistema.setSobrecarga(value); })
    sistemaFolder.open()
}

/* 
Faz a Gestão do controle dos processos presentes na Aplicação. Dentre as operações presentes nesse controle,
estão as funções de adicionar um processo e a de removê-lo do Sistema a partir do clique do botão na GUI da
Aplicação.
*/
function controlFolderProcessos() {
    processosFolder = gui.addFolder('Processos');
    let processos = { 'Adiciona Processo': addProcesso, 'Remove Processo': removeProcesso };
    processosFolder.add(processos, 'Adiciona Processo').onChange();
    processosFolder.add(processos, 'Remove Processo').onChange();
    processosFolder.open()
}

/* 
Faz a Gestão do controle do Algoritmo de Escalonamento que será escolhido para ser animado, entre eles:
 - FIFO
 - RR
 - EDF
 - SJF
*/
function controlAlgoritmosFolder() {
    algoritmosFolder = gui.addFolder('Algoritmos de Escalonamento');
    let entradaVazia = { Algoritmo: '' };
    const algoritmosDeEscalonamento = ['FIFO', 'RR', 'EDF', 'SJF'];
    algoritmosFolder.add(entradaVazia, 'Algoritmo').options(algoritmosDeEscalonamento)
        .onChange((value) => {
            algoritmoOption = value;
        })
    algoritmosFolder.open()
}

/* 
Faz o controle da animação da Cena, fazendo o início da cena, após a adição de processos, escolha do algoritmo
e também faz o controle do delay da animação.
*/
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

/* 
Função que tem como objetivo a criação de um processo e adição do mesmo na lista de processos, para posteriormente
passar para o algoritmo de escalonamento e ser processado de acordo com suas especificidades.
Faz a criação do processo e lista-o, além de Fazer o controle do Tempo de execução, Chegada, Deadline e também
as suas páginas de memória.
*/
function addProcesso() {
    quantidadeDeProcessos++;
    let processoCorrenteController = processosFolder.addFolder('Processo ' + quantidadeDeProcessos);
    let processoVariaveis = { 'Tempo de Chegada': 0, 'Tempo de Execução': 0, 'Deadline': 0, 'Páginas': "" }
    const processoCorrente = new Processo(quantidadeDeProcessos)
    processoCorrenteController.open();
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

/* 
Remove um processo da lista de processos, sendo este processo o último a ser adicionado na lista.
*/
function removeProcesso() {
    if (quantidadeDeProcessos > 0) {
        processosFolder.removeFolder(gui.__folders.Processos.__folders['Processo ' + quantidadeDeProcessos])
        listaDeProcessos.pop()
        quantidadeDeProcessos--;
    }
}

/* 
Função que inicia os retângulos gráficos e adiciona na scena os mesmos
*/
function iniciaRetangulos(listaDeRetangulos) {
    listaDeRetangulos.forEach(retangulo => {
        let ret;
        if (retangulo.isSobrecarga() || retangulo.isSobrecarga() && r.isSobrecarga()) {
            ret = criaRetangulo(0.0, 0.0, 0.0, 0xaa0000);
        } else if (retangulo.isDeadlineBool() && !retangulo.isSobrecarga()) {
            ret = criaRetangulo(0.0, 0.0, 0.0, 0xAAAAAA);
        } else {
            ret = criaRetangulo(0.0, 0.0, 0.0);
        }
        listaDeRetangulosGraficos.push(ret);
    })
}

/* 
Faz a adição na cena do processo ID, que é um P + id do processo, para fazer uma identificação melhor na animação,
sendo melhor para o usuário ver quando usar a Aplicação.
*/
function criarIdProcessoObjetoDeCena(idProcesso) {
    const textoDeApresentacao = "P" + parseInt(idProcesso);
    const loader = new FontLoader();
    let textMesh = new THREE.Mesh();
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

        const materials = new THREE.MeshBasicMaterial({ color: 0x000000, wireframe: true });

        textMesh.geometry = textGeo;
        textMesh.material = materials;

        textMesh.position.x = -1;
        textMesh.position.y = (idProcesso + (idProcesso - 1));
    })

    return textMesh;
}

/* 
Função que lista os identificadores de processo para serem colocados na cena.
*/
function identificarProcessos(listaDeProcessos) {
    listaDeIdentificadoresGraficos = [];
    listaDeProcessos.forEach((processoListado) => {
        const processoId = criarIdProcessoObjetoDeCena(processoListado.id);
        scene.add(processoId);
        listaDeIdentificadoresGraficos.push(processoId);
    })
}

/* 
Faz um remapeamento de todos os processo, juntando as informações do processo e recriando-o com as informações
mais precisas para ser usado para executar o algoritmo de escalonamento.
*/
function remapeamentoDeProcesso(listaDeProcessos) {
    let newList = [];
    for (let i = 0; i < listaDeProcessos.length; i++) {
        let processo = listaDeProcessos[i];
        newList.push(new Processo(processo.getId(), processo.getTempoDeChegada(), processo.getTempoDeExecucao(), processo.getDeadline(), processo.getPaginas()));
    }
    return newList;
}

/* 
Função que executa o algoritmo de escalonamento e inicia a lista de retângulos para serem colocadas na cena.
*/
function executaAlgoritmoDeEscalonamento(value) {
    switch (value) {
        case "FIFO":
            if (listaDeProcessos.length > 0) {
                let newlist = remapeamentoDeProcesso(listaDeProcessos);
                identificarProcessos(listaDeProcessos);
                let obj = findTurnAroundTimeFIFO(newlist, sistema.getQuantum(), sistema.getSobrecarga());
                listaDeRetangulos = obj.listaDeRetangulos;
                turnAround = obj.Tat;
                waitingTime = obj.Wt;
            }
            if (listaDeRetangulos) {
                iniciaRetangulos(listaDeRetangulos, listaDeRetangulosGraficos);
            }
            break;
        case "RR":
            if (listaDeProcessos.length > 0) {
                let newlist = remapeamentoDeProcesso(listaDeProcessos);
                identificarProcessos(listaDeProcessos);
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
                let obj = findavgTimeEDF(listaDeProcessos, sistema.getQuantum(), sistema.getSobrecarga());
                identificarProcessos(listaDeProcessos);
                listaDeRetangulos = obj.listaDeRetangulos;
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
                identificarProcessos(listaDeProcessos);
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

/* 
Função que cria os textos para serem colocados na tela. São as seguintes informações:
- Turnaround.
- Waiting Time (Tempo de espera).
*/
function mostrarValoresTatWt(text = "", value, interval = 0) {
    const textoDeApresentacao = text + ": " + parseFloat(value);
    const loader = new FontLoader();
    let textMesh = new THREE.Mesh();
    loader.load('src/helvetiker_regular.typeface.json', function(font) {
        const textGeo = new TextGeometry(textoDeApresentacao, {
            font: font,
            size: 0.6,
            height: 0.01,
            curveSegments: 20,
            bevelThickness: 1,
            bevelSize: 0.01,
            bevelEnabled: true
        });

        textGeo.computeBoundingBox();

        const materials = new THREE.MeshBasicMaterial({ color: 0x0000FF, wireframe: true });

        textMesh.geometry = textGeo;
        textMesh.material = materials;

        textMesh.position.x = -4.7;
        textMesh.position.y = -2.5 - interval;
    })

    return textMesh;
}

function criaLegenda(texto, ret, interval = 0) {
    const textoDeApresentacao = texto;
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

        const materials = new THREE.MeshBasicMaterial({ color: 0x000000, wireframe: true });
        textMesh1.geometry = textGeo;
        textMesh1.material = materials;

        textMesh1.position.x = 3 + interval;
        textMesh1.position.y = -4;

        let intervaloRet = interval + 1.8;

        mudaGeometria(ret, intervaloRet, intervaloRet + 1, -3, -1, ret.material.color);

        // mudaGeometria(ret, -5, 1, interval - 2, interval, ret.material.color);

    })

    scene.add(textMesh1)
}

/* 
Faz o desenho da legenda dos processos
*/
function desenhaLegenda() {
    let textoDaLegendaProcessoExecutando = "Executado";
    let textoDaLegendaProcessoDeadline = "Deadline Estourado";
    let textoDaLegendaProcessoSobrecarga = "Sobrecarga";

    let retanguloProcessoExecutando = criaRetangulo();
    let retanguloProcessoDeadline = criaRetangulo(0xFF0000);
    let retanguloProcessoSobrecarga = criaRetangulo(0xAAAAAA);

    scene.add(retanguloProcessoExecutando)
    scene.add(retanguloProcessoDeadline)
    scene.add(retanguloProcessoSobrecarga)

    criaLegenda(textoDaLegendaProcessoExecutando, retanguloProcessoExecutando);
    criaLegenda(textoDaLegendaProcessoDeadline, retanguloProcessoDeadline, 6);
    criaLegenda(textoDaLegendaProcessoSobrecarga, retanguloProcessoSobrecarga, 14);
}

/* 
Faz a mudança de geometria que basicamente é animar a cena, fazendo com que os retângulos sejam desenhados na cena,
que nada mais é que basicamente mudar a geometria dos retângulos que estão carregados na cena, fazendo isso
com aa mudança da velocidade. Um Retângulo Gráfico nada mais é do que Dois retângulos que compõe um retângulo.
Quando acaba de desenhar o ultimo Retângulo, faz com que a flag de pode desenhar na tela os valores de Turnaround
e Waiting Time, que é o final da execução dos processos na cena.
*/
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
                desenhaLegenda();
                podeEscrever = true;
                flag = true;
            }
        }
        mudaGeometria(retanguloMudanca, tempoInicial, tempoFinal, posicaoMinY, posicaoMaxY, color);
    }
}

/* 
Faz a numeração dos eixos da cena, que nada mais é do que desenhar as linhas verticais, para facilitar a leitura. 
*/
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

/* 
Faz a iniciação da cena, desenhando o básico para fazer posteriormente o carregamento da animação.
*/
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
    limparCena();
}

/* Renderiza a animação da cena, desenhando os retângulos */
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
                    scene.remove(turnAroundGrafico);
                }
                if (waitingTimeGrafico) {
                    scene.remove(waitingTimeGrafico);
                }
                turnAroundGrafico = mostrarValoresTatWt("Turnaround", turnAround.toFixed(2));
                scene.add(turnAroundGrafico);
                waitingTimeGrafico = mostrarValoresTatWt("Tempo \nde Espera", waitingTime.toFixed(2), 3);
                scene.add(waitingTimeGrafico);
                velocidadeAtual += 0.0;
                podeEscrever = false;
            }
            scene.add(retanguloGrafico);
        }
    }
    renderer.render(scene, camera);
}

/* 
Faz o controle da cena, fazendo com que seja possível caminhar pela cena e e olhando coisas que não estão sendo
visualizadas no campo de visão normal do usuário.
*/
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

/* 
Faz a limpeza da cena, fazendo com que retiremos os elementos não básicos da cena, poupando memória na execução.
*/
function limparCena() {
    if (scene.children.length > 201) {
        for (let i = scene.children.length - 1; i >= 201; i--) {
            scene.remove(scene.children[i]);
            flag = false;
        }
    }
}

/*
Função chamada após clickar em "Iniciar" na GUI, para iniciar a cena.
*/
function iniciar() {
    limparCena();
    executaAlgoritmoDeEscalonamento(algoritmoOption, listaDeProcessos);
    velocidadeAtual = 0.0;
    render();
}

/*
Função que carrega as funcionalidades básicas do sistema.
*/
function main() {
    controlFolderSistema();
    controlFolderProcessos();
    controlAlgoritmosFolder();
    controlIniciarFolder();
    iniciarCena();
}

main();
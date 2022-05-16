import * as THREE from '../node_modules/three/build/three.module.js';
import { GUI } from '../node_modules/dat.gui/build/dat.gui.module.js'

const gui = new GUI({name: "Escalonamento"})
gui.width = 600

var scene, renderer, camera, axesHelper;

/* Pastas do GUI */
var sistemaFolder, processosFolder, iniciarProcessosFolder, algoritmosFolder;

var controllerProcessosAddProcesso, controllerProcessosRemoveProcesso;
var quantidadeDeProcessos = 1;

const LIMITE_SUPERIOR = 100;
const LIMITE_INFERIOR = 0;

var listaDeProcessos = [];
var processoEntradaSistema = []
var controllers = []

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
	constructor(tempoDeChegada, tempoDeExecucao, deadline) {
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


function init() {
	renderer = new THREE.WebGLRenderer();
	renderer.setClearColor(new THREE.Color(0.0, 0.0, 0.0));
	
	sistemaFolder = gui.addFolder('Sistema');
	var objetoSistema = {Quantum: 0, Sobrecarga: 0}
	sistemaFolder.add( objetoSistema, 'Quantum', LIMITE_INFERIOR, LIMITE_SUPERIOR, 1).onChange( (value) => { sistema.setQuantum(value); } )
	sistemaFolder.add( objetoSistema, 'Sobrecarga', LIMITE_INFERIOR, LIMITE_SUPERIOR, 1).onChange( (value) => { sistema.setSobrecarga(value); } )
	sistemaFolder.open()
	
	processosFolder = gui.addFolder('Processos');
	var processos = {'Adiciona Processo': addProcesso, 'Remove Processo': removeProcesso};
	controllerProcessosAddProcesso = processosFolder.add(processos, 'Adiciona Processo');
	controllerProcessosRemoveProcesso = processosFolder.add(processos, 'Remove Processo');
	processosFolder.open()
	
	algoritmosFolder = gui.addFolder('Algoritmos de Escalonamento');
	var entradaVazia = {Algoritmo: ''};
	const algoritmosDeEscalonamento = [ 'FIFO', 'Round-Robin', 'EDF', 'SJF'];
	const controllerAlgoritmosEscalonamento = algoritmosFolder.add( entradaVazia, 'Algoritmo' ).options( algoritmosDeEscalonamento )
	algoritmosFolder.open()

	controllerAlgoritmosEscalonamento.onChange((value) => {
		if(value == "FIFO") {
			console.log("FIFO")
		}
		if(value == "Round-Robin") {
			console.log("Round-Robin")
		}
		if(value == "EDF") {
			console.log("EDF")
		}
		if(value == "SJF") {
			console.log("SJF")
		}
	})

	
	iniciarProcessosFolder = gui.addFolder('Iniciar');
	var iniciarProcessos = {Run: iniciar};
	const controllerIniciarProcessos = iniciarProcessosFolder.add( iniciarProcessos, 'Run' )
	iniciarProcessosFolder.open()

    const element = document.getElementById('canvas-three')
	const width = 900;
	const height = 500;

	renderer.setSize(width, height);
	
	element.appendChild(renderer.domElement);
	
	scene = new THREE.Scene();

	camera = new THREE.OrthographicCamera( width / -100, width / 2, height / 2, height / -50, width / height, 0 );
    scene.add( camera );

	axesHelper = new THREE.AxesHelper(10000);

	scene.add(axesHelper);
};

function addProcesso() {
	controllerProcessosAddProcesso.onChange(() => {
		var processoCorrenteController = processosFolder.addFolder('Processo '+quantidadeDeProcessos);
		listaDeProcessos.push(processosFolder.__folders['Processo '+quantidadeDeProcessos]);
		var processoVariaveis = {'Tempo de Chegada': 0, 'Tempo de Execução': 0, 'Deadline': 0}
		
		
		var controllerTempoDeChegada = processoCorrenteController.add(processoVariaveis, 'Tempo de Chegada', LIMITE_INFERIOR, LIMITE_SUPERIOR, 1);
		var controllerTempoDeExecucao = processoCorrenteController.add(processoVariaveis, 'Tempo de Execução', LIMITE_INFERIOR, LIMITE_SUPERIOR, 1);
		var controllerDeadline = processoCorrenteController.add(processoVariaveis, 'Deadline', LIMITE_INFERIOR, LIMITE_SUPERIOR, 1);
		
		controllers.push(controllerTempoDeChegada)

		const processoCorrente = new ProcessoInput()

		changeTempoDeChegada(controllerTempoDeChegada, processoCorrente)
		changeTempoDeExecucao(controllerTempoDeExecucao, processoCorrente)
		changeDeadline(controllerDeadline, processoCorrente)
		
		processoEntradaSistema.push(processoCorrente)

		quantidadeDeProcessos++;
	})
}

// Faz a mudança no atributo de tempo de chegada do objeto que captura os dados do processo
function changeTempoDeChegada(controllerTempoDeChegada, processoCorrente) {
	controllerTempoDeChegada.onChange((value) => {
		processoCorrente.setTempoDeChegada(value)
	})
}
// Faz a mudança no atributo de tempo de execucao do objeto que captura os dados do processo
function changeTempoDeExecucao(controllerTempoDeExecucao, processoCorrente) {
	controllerTempoDeExecucao.onChange((value) => {
		processoCorrente.setTempoDeExecucao(value)
	})
}
// Faz a mudança no atributo de deadline do objeto que captura os dados do processo
function changeDeadline(controllerDeadline, processoCorrente) {
	controllerDeadline.onChange((value) => {
		processoCorrente.setDeadline(value)
	})
}

function removeProcesso() {
	controllerProcessosRemoveProcesso.onChange(() => {
		if((quantidadeDeProcessos-1) >= 1) {
			processosFolder.removeFolder(gui.__folders.Processos.__folders['Processo '+(quantidadeDeProcessos-1)])
			listaDeProcessos.pop()
			console.log(listaDeProcessos)
			quantidadeDeProcessos--;
		}
	})
}

function setQuantum(value) {
	quantum = value;
}

function setSobrecarga(value) {
	sobrecarga = value;
}

function iniciar() {
	render()
}


function render() {
	console.log(sistema)
	console.log(processoEntradaSistema)
	renderer.render(scene, camera);
}

init();


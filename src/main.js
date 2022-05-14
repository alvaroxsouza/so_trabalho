import * as THREE from '../node_modules/three/build/three.module.js';
import { GUI } from '../node_modules/dat.gui/build/dat.gui.module.js'

const gui = new GUI({name: "Escalonamento"})
gui.width = 600

var scene, renderer, camera, axesHelper;

var controllerQuantumSistema, controllerSobreCargaSistema, controllerProcessosAddProcesso, controllerProcessosRemoveProcesso;
var processosFolder;
var quantidadeDeProcessos = 1;
var listaDeProcessos = [];

const LIMITE_SUPERIOR = 100;
const LIMITE_INFERIOR = 0;

// Variáveis de sistema
var quantum, sobrecarga;


function init() {

	renderer = new THREE.WebGLRenderer();

	renderer.setClearColor(new THREE.Color(0.0, 0.0, 0.0));
	
	processosFolder = gui.addFolder('Processos');
	var processos = {Quantum: 0, Sobrecarga: 0, 'Adiciona Processo': addProcesso, 'Remove Processo': removeProcesso};

	controllerQuantumSistema = processosFolder.add( processos, 'Quantum', LIMITE_INFERIOR, LIMITE_SUPERIOR, 1);
	controllerQuantumSistema.onChange((value) => {
		setQuantum(value);
	})
	controllerSobreCargaSistema = processosFolder.add( processos, 'Sobrecarga', LIMITE_INFERIOR, LIMITE_SUPERIOR, 1);
	controllerSobreCargaSistema.onChange((value) => {
		setSobrecarga(value);
	})

	controllerProcessosAddProcesso = processosFolder.add(processos, 'Adiciona Processo');
	controllerProcessosRemoveProcesso = processosFolder.add(processos, 'Remove Processo');
	
	processosFolder.open()
	
	var algoritmosFolder = gui.addFolder('Algoritmos de Escalonamento');
	var entradaVazia = {Algoritmo: ''};
	const algoritmosDeEscalonamento = [ 'FIFO', 'Round-Robin', 'EDF', 'SJF'];
	const controllerAlgoritmosEscalonamento = algoritmosFolder.add( entradaVazia, 'Algoritmo' ).options( algoritmosDeEscalonamento )
	algoritmosFolder.open()

	controllerAlgoritmosEscalonamento.onChange(() => {
		if(controllerAlgoritmosEscalonamento.object.algoritmo == "FIFO") {
			console.log("FIFO")
		}
		if(controllerAlgoritmosEscalonamento.object.algoritmo == "Round-Robin") {
			console.log("RR")
		}
		if(controllerAlgoritmosEscalonamento.object.algoritmo == "EDF") {
			console.log("EDF")
		}
		if(controllerAlgoritmosEscalonamento.object.algoritmo == "SJF") {
			console.log("SJF")
		}
	})

	
	var iniciarProcessosFolder = gui.addFolder('Iniciar');
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
		
		processoCorrenteController.add( processoVariaveis, 'Tempo de Chegada', LIMITE_INFERIOR, LIMITE_SUPERIOR, 1);
		processoCorrenteController.add( processoVariaveis, 'Tempo de Execução', LIMITE_INFERIOR, LIMITE_SUPERIOR, 1);
		processoCorrenteController.add( processoVariaveis, 'Deadline', LIMITE_INFERIOR, LIMITE_SUPERIOR, 1);
		

		quantidadeDeProcessos++;
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

function render() {
	renderer.render(scene, camera);
}

init();


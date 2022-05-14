import * as THREE from '../node_modules/three/build/three.module.js';
import Stats from "../node_modules/three/examples/jsm/libs/stats.module.js"
import { GUI } from '../node_modules/dat.gui/build/dat.gui.module.js'

const gui = new GUI({name: "Escalonamento"})
var scene, renderer, camera, axesHelper;

var controllerQuantumSistema, controllerSobreCargaSistema, controllerProcessosAddProcesso, controllerProcessosRemoveProcesso;
var processosFolder;
var quantidadeDeProcessos = 1;
var listaDeProcessos = []

const LIMITE_SUPERIOR = 100;
const LIMITE_INFERIOR = 1;

function init() {

	renderer = new THREE.WebGLRenderer();
	const stats = Stats()

	renderer.setClearColor(new THREE.Color(0.0, 0.0, 0.0));
	
	processosFolder = gui.addFolder('Processos');
	var processos = {Quantum: 1, Sobrecarga: 1, adicionarProcesso: addProcesso, removerProcesso: removeProcesso};

	controllerQuantumSistema = processosFolder.add( processos, 'Quantum', LIMITE_INFERIOR, LIMITE_SUPERIOR, 1 );
	controllerSobreCargaSistema = processosFolder.add( processos, 'Sobrecarga', LIMITE_INFERIOR, LIMITE_SUPERIOR, 1 );
	controllerProcessosAddProcesso = processosFolder.add(processos, 'adicionarProcesso');
	controllerProcessosRemoveProcesso = processosFolder.add(processos, 'removerProcesso');
	
	processosFolder.open()

	
	var algoritmosFolder = gui.addFolder('Algoritmos de Escalonamento');
	var entradaVazia = {algoritmo: ''};
	const algoritmosDeEscalonamento = [ 'FIFO', 'Round-Robin', 'EDF', 'SJF'];
	const controllerAlgoritmosEscalonamento = algoritmosFolder.add( entradaVazia, 'algoritmo' ).options( algoritmosDeEscalonamento )
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
	
	element.appendChild(stats.dom)
	
	const width = 900;
	const height = 500;

	renderer.setSize(width, height);
	
	element.appendChild(renderer.domElement);
	
	scene = new THREE.Scene();

	camera = new THREE.OrthographicCamera( width / -100, width / 2, height / 2, height / -50, width / height, 0 );
    scene.add( camera );

	axesHelper = new THREE.AxesHelper(10000);

	scene.add(axesHelper);

	render()
};

function addProcesso() {
	controllerProcessosAddProcesso.onChange(() => {
		var processoCorrenteController = processosFolder.addFolder('Processo'+quantidadeDeProcessos);
		var processoVariaveis = {tempoChegada: 1, tempoExecucao: 1, deadline: 1, quantumSistema: 1, sobrecargaSistema: 1}
		
		processoCorrenteController.add( processoVariaveis, 'tempoChegada', LIMITE_INFERIOR, LIMITE_SUPERIOR, 1 );
		processoCorrenteController.add( processoVariaveis, 'tempoExecucao', LIMITE_INFERIOR, LIMITE_SUPERIOR, 1 );
		processoCorrenteController.add( processoVariaveis, 'deadline', LIMITE_INFERIOR, LIMITE_SUPERIOR, 1 );
		
		listaDeProcessos.push(processoCorrenteController);

		quantidadeDeProcessos++;
	})
}

function iniciar() {
	console.log("Iniciado")
}

function removeProcesso() {
	controllerProcessosRemoveProcesso.onChange(() => {
		if((quantidadeDeProcessos-1) >= 1) {
			processosFolder.removeFolder(gui.__folders.Processos.__folders['Processo'+(quantidadeDeProcessos-1)])
			quantidadeDeProcessos--;
		}
	})
}

function render() {
	renderer.render(scene, camera);
}

init();


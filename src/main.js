import * as THREE from '../node_modules/three/build/three.module.js';
import Stats from "../node_modules/three/examples/jsm/libs/stats.module.js"
import { GUI } from '../node_modules/dat.gui/build/dat.gui.module.js'

var scene, renderer, camera, axesHelper;
var controllerProcessosAddProcesso, controllerProcessosRemoveProcesso;
var quantidadeDeProcessos = 1;
const gui = new GUI({name: "Escalonamento"})

var processosFolder;

var listaDeProcessos = []
const LIMITE_SUPERIOR_QUANTIDADE_DE_PROCESSOS = 100;
const LIMITE_INFERIOR_QUANTIDADE_DE_PROCESSOS = 1;

function init() {

	renderer = new THREE.WebGLRenderer();
	const stats = Stats()

	renderer.setClearColor(new THREE.Color(0.0, 0.0, 0.0));
	
	processosFolder = gui.addFolder('Processos');
	var processos = {adicionarProcesso: addProcesso, removerProcesso: removeProcesso};

	controllerProcessosAddProcesso = processosFolder.add(processos, 'adicionarProcesso');
	controllerProcessosRemoveProcesso = processosFolder.add(processos, 'removerProcesso');

	processosFolder.open()

	
	var algoritmosFolder = gui.addFolder('Algoritmos de Escalonamento');
	var algoritmosEscalonamento = {name: ''};
	const states = [ 'FIFO', 'Round-Robin', 'EDF', 'SJF'];
	const clipCtrl = algoritmosFolder.add( algoritmosEscalonamento, 'name' ).options( states )
	algoritmosFolder.open()

	clipCtrl.onChange( () => {
		if(clipCtrl.object.name == "FIFO") {
			console.log("FIFO")
		}
		if(clipCtrl.object.name == "Round-Robin") {
			console.log("RR")
		}
		if(clipCtrl.object.name == "EDF") {
			console.log("EDF")
		}
		if(clipCtrl.object.name == "SJF") {
			console.log("SJF")
		}
	})


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
	controllerProcessosAddProcesso.onChange( () => {
		console.log(quantidadeDeProcessos)
		listaDeProcessos.push(processosFolder.addFolder('Processo'+quantidadeDeProcessos));
		quantidadeDeProcessos++;
	})
}

function removeProcesso() {
	controllerProcessosRemoveProcesso.onChange(() => {
		processosFolder.removeFolder(gui.__folders.Processos.__folders['Processo'+(quantidadeDeProcessos-1)])
		quantidadeDeProcessos--;
	})
}

function render() {
	renderer.render(scene, camera);
}

init();


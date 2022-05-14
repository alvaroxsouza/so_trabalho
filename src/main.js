import * as THREE from '../node_modules/three/build/three.module.js';

var scene, renderer, camera;

var botaoDeIniciar = document.getElementById('iniciar-botao')

function init() {

	renderer = new THREE.WebGLRenderer();

	renderer.setClearColor(new THREE.Color(0.0, 0.0, 0.0));
	
    const element = document.getElementById('canvas-three')
	
	renderer.setSize(700, 500);
	
	element.appendChild(renderer.domElement);

	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera( 45.0, window.innerWidth/window.innerHeight, 0.01, 20000.0);
    
    renderer.render(scene, camera);	

	// render();
};


function render() {
	requestAnimationFrame(render);
} 

init();


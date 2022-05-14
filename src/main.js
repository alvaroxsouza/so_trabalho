import * as THREE from '../node_modules/three/build/three.module.js';
import Stats from "../node_modules/three/examples/jsm/libs/stats.module.js"
import { GUI } from '../node_modules/dat.gui/build/dat.gui.module.js'

var scene, renderer, camera, axesHelper;

function init() {

	renderer = new THREE.WebGLRenderer();
	const stats = Stats()
	const gui = new GUI()
	
	renderer.setClearColor(new THREE.Color(0.0, 0.0, 0.0));
	
    const element = document.getElementById('canvas-three')
	
	element.appendChild(stats.dom)
	
	const width = 900;
	const height = 500;

	renderer.setSize(width, height);
	
	element.appendChild(renderer.domElement);
	
	scene = new THREE.Scene();

	/* camera = new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2, 1, 1000 );
	scene.add( camera ); */

	camera = new THREE.OrthographicCamera( width / -100, width / 2, height / 2, height / -50, width / height, 0 );
    scene.add( camera );

	axesHelper = new THREE.AxesHelper(10000);

	scene.add(axesHelper);

	render()
};

function render() {
	renderer.render(scene, camera);
}

init();


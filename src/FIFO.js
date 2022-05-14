// Controle de camera com GUI.

import * as THREE from 'three';
// Test Setup
var testArr = [1,2,3,4,5];
var arr = [1,2];

function main(){
	//Fazendo pop e adicionando um novo elemento
	console.log("Before: " + JSON.stringify(arr));
	console.log(fifo(arr, 3));
	console.log("After: " + JSON.stringify(arr));

	//Só fazendo pop
	console.log("Before: " + JSON.stringify(testArr));
	console.log(fifo(testArr));
	console.log("After: " + JSON.stringify(testArr));

}

function fifo(arr, item) {
	var removedElement = arr.shift();
	arr.push(item);
	return removedElement;
  }

main();
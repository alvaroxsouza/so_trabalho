// Controle de camera com GUI.

import * as THREE from 'three';
// Test Setup
var testArr = [1, 2, 3, 4, 5];
var arr = [1, 2];
var t = 0; // Current time
var total = 0;


function fifo(arr, item) {
	var removedElement = arr.shift();
	arr.push(item);
	return removedElement;
}

var over; //sobrecarga
var timeStart; //vetor de tempo de chegada

// Function to find the waiting time for all
// processes
const tempoDeExecucaoTotal = (processes, n, bt) => {
	// Make a copy of burst times bt[] to store remaining
	// burst times.

	

	// Keep traversing processes in round robin manner
	// until all of them are not done.


	// Traverse all processes one by one repeatedly
	for (let i = 0; i < n; i++) {
		//tempo atual maior ou igual o tempo de chegada
			t += bt[i]; //tempo de execução
			total+=t-timeStart[i]; //tempo de execução menos os tempos de chegada
		//se nenhum processo for executado adiciona 1 ao tempo 
	} 
}

function  findTurnAroundTime (n) {
	console.log(total/n);
}




function main() {
	// Driver code
	// process id's
	var processes = [1, 2, 3];
	let n = processes.length;
	timeStart = [0, 2, 3];
	// Burst time of all processes
	let burst_time = [10, 5, 8];
	tempoDeExecucaoTotal (processes, n, burst_time);
	findTurnAroundTime (n);
	

}

main();
// Test Setup
var testArr = [1, 2, 3, 4, 5];
var arr = [1, 2];
var t = 0; // Current time
var total = 0;

var priorityEndline;

class Processo {
	constructor(id, timeStart, burstTime) {
		this.id = id;
		this.timeStart = timeStart;
		this.burstTime = burstTime;
		this.burstTimeNow = burstTime;
		this.deadlineOverflow = false;
		this.waitingTime = 0;
		this.turnAround = 0;
	}
}

function fifo(arr, item) {
	var removedElement = arr.shift();
	arr.push(item);
	return removedElement;
}


//Tempo total de execução
const tempoDeExecucaoTotal = (processes, n) => {

	processes.sort(function (a, b) { //sort para ordenar o tempo de chegada
		if (a.timeStart > b.timeStart) {
			return 1;
		}
		if (a.timeStart < b.timeStart) {
			return -1;
		}
		return 0;
	});
		
	for (let i = 0; i < n; i++) {
		//tempo atual maior ou igual o tempo de chegada
			t += processes[i].burstTime; //tempo de execução
			total+=t-processes[i].timeStart; //tempo de execução menos os tempos de chegada
		//se nenhum processo for executado adiciona 1 ao tempo 
	} 
}

function  findTurnAroundTime (n) {
	console.log(total/n);
}




function main() {

	var teste = new Processo(1, 0, 10);
	var teste2 = new Processo(2, 2, 5);
	var teste3 = new Processo(3, 3, 8);

	let n = 3;

	var processes = new Array(n).fill(0);
	processes[0] = teste;
	processes[1] = teste2;
	processes[2] = teste3;

	tempoDeExecucaoTotal (processes, n);
	findTurnAroundTime (n);
	

}

main();
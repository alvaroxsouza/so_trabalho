/*
 * Para cada volta do looping, ordenamos o vetor de processos e testamos.
 * Se existir 1 processo com o tempo tempo de chegada >= tempo atual, adiciona ao vetor.
 * Se existir mais de 1 processo com o tempo de chegada >= tempo atual,
 * ordena pelo deadline e adiciona no vetor principal.
 */
var vetorPrincipal; //Vetor para funcionamento do algoritmo
var vetorAuxiliar; //Vetor para ordenar pelo deadline
var vetorCopiaProcessos; //Vetor para ordenar pelo tempo de chegada
var over;

class Processo {
	constructor(id, timeStart, deadline, burstTime) {
		this.id = id;
		this.timeStart = timeStart;
		this.deadline = deadline;
		this.burstTime = burstTime;
		this.burstTimeNow = burstTime;
		this.deadlineOverflow = false;
		this.waitingTime = 0;
		this.turnAround = 0;
	}
}

//function ordenaPorOrdemDeChegada ()

// Function to find the waiting time for all
// processes
const findWaitingTime = (processes, n, quantum, overload) => {
	let t = 0; // Current time
	vetorPrincipal = []; //Inicia vetor principal (PRECISA ESTAR AQUI)

	vetorCopiaProcessos = new Array(n).fill(0); //Faz uma cópia dos processos
	for (let i = 0; i < n; i++)
		vetorCopiaProcessos[i] = processes[i];
	vetorCopiaProcessos.sort(function (a, b) { //Ordenando pela ordem de chegada de cada processo
		if (a.timeStart > b.timeStart) {
			return 1;
		}
		if (a.timeStart < b.timeStart) {
			return -1;
		}
		return 0;
	});

	//Loop de execução
	while (1) {
		vetorAuxiliar = [];
		for (let i = 0; i < n; i++) { //Pega os processos que podem ser executados e guarda no vetor auxiliar
			if (vetorCopiaProcessos[i] != 0 && vetorCopiaProcessos[i].timeStart <= t) {
				vetorAuxiliar.push(vetorCopiaProcessos[i]);
				vetorCopiaProcessos[i] = 0;
			}
		}
		vetorAuxiliar.sort(function (a, b) { //Ordena o vetor auxiliar pelo deadline
			if (a.deadline > b.deadline) {
				return 1;
			}
			if (a.deadline < b.deadline) {
				return -1;
			}
			return 0;
		});

		for (let i = 0; i < vetorAuxiliar.length; i++) {
			//Adiciona na fila principal
			if (vetorPrincipal)
				vetorPrincipal.push(vetorAuxiliar[i]);
		}

		if (vetorPrincipal && vetorPrincipal.length > 0) {
			if (vetorPrincipal[0].burstTimeNow > 0) {

				if (vetorPrincipal[0].burstTimeNow > quantum) {
					// Increase the value of t i.e. shows
					// how much time a process has been processed
					t += quantum;
					t += overload;

					// Decrease the burst_time of current process
					// by quantum
					vetorPrincipal[0].burstTimeNow -= quantum;
				}

				// If burst time is smaller than or equal to
				// quantum. Last cycle for this process
				else {
					// Increase the value of t i.e. shows
					// how much time a process has been processed
					t = t + vetorPrincipal[0].burstTimeNow;

					// Waiting time is current time minus time
					// used by this process
					if (processes) {
						for (let i = 0; i < n; i++) {
							if (vetorPrincipal[0]) {
								if (processes[i].id == vetorPrincipal[0].id) {
									processes[i].waitingTime = t - vetorPrincipal[0].burstTime;
								}
							}
						}
					}

					// As the process gets fully executed
					// make its remaining burst time = 0
					vetorPrincipal[0].burstTimeNow = 0;
					vetorPrincipal.shift();
					//Retirando os elementos nulos
					if (vetorPrincipal) {
						vetorPrincipal = vetorPrincipal.filter(function (el) {
							return el != null;
						});
					}

					if (vetorPrincipal.length == 0) {
						break;
					}
				}
			}
			else {
				t++;
			}
		}
	}
}

// Function to calculate turn around time
const findTurnAroundTime = (processes, n) => {
	// calculating turnaround time by adding
	// bt[i] + wt[i]
	for (let i = 0; i < n; i++) {
		if (processes) {
			processes[i].turnAround = processes[i].burstTime + processes[i].waitingTime - processes[i].timeStart;
		}
	}
}

// Function to calculate average time
const findavgTime = (processes, n, quantum) => {
	let total_wt = 0, total_tat = 0;

	// Function to find waiting time of all processes
	findWaitingTime(processes, n, quantum, over);

	// Function to find turn around time for all processes
	findTurnAroundTime(processes, n);

	// Display processes along with all details
	//document.write(`Processes Burst time Waiting time Turn around time<br/>`);
	console.log(`Processes/Burst time/Waiting time/Turn around time`);

	// Calculate total waiting time and total turn
	// around time
	for (let i = 0; i < n; i++) {
		if (processes) {
			total_wt = total_wt + processes[i].waitingTime;
			total_tat = total_tat + processes[i].turnAround;

			//document.write(`${i + 1} ${bt[i]} ${wt[i]} ${tat[i]}<br/>`);
			console.log(`${processes[i].id} ${processes[i].burstTime} ${processes[i].waitingTime} ${processes[i].turnAround}`);
		}
	}

	console.log(`Average waiting time = ${total_wt / n}`);
	//document.write(`Average waiting time = ${total_wt / n}`);
	console.log(`Average turn around time = ${total_tat / n}`);
	//document.write(`<br/>Average turn around time = ${total_tat / n}`);
	console.log(processes)
}

function main() {
	over = 1;
	// Time quantum
	let quantum = 2;
	// findavgTime(processes, n, burst_time, quantum, over, timeStart);

	var teste = new Processo(1, 0, 10, 4);
	var teste2 = new Processo(2, 2, 8, 6);
	var teste3 = new Processo(3, 4, 10, 7);

	let n = 3;

	var processes = new Array(n).fill(0);
	processes[0] = teste;
	processes[1] = teste2;
	processes[2] = teste3;


	findavgTime(processes, n, quantum);
}

main();
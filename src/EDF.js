/*
 * Para cada volta do looping, ordenamos o vetor de processos e testamos.
 * Se existir 1 processo com o tempo tempo de chegada >= tempo atual, adiciona ao vetor.
 * Se existir mais de 1 processo com o tempo de chegada >= tempo atual,
 * ordena pelo deadline e adiciona no vetor principal.
 */
var vetorPrincipal; //Vetor para funcionamento do algoritmo
var vetorAuxiliar; //Vetor para ordenar pelo deadline
var vetorCopiaProcessos; //Vetor para ordenar pelo tempo de chegada
var over; //Variável que guarda a sobrecarga

class Processo {
	constructor(id, timeStart, deadline, burstTime) {
		this.id = id;
		this.timeStart = timeStart;
		this.deadline = deadline;
		this.burstTime = burstTime;
		this.burstTimeNow = burstTime;
		this.deadlineOverflow = false;
		this.deadlineOverflowQuant = -1;
		this.waitingTime = 0;
		this.turnAround = 0;
	}
}

// Função que calcula o tempo de espera de cada processo
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

	var contador = 0;
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

		//Adiciona os processos aptos na fila principal
		for (let i = 0; i < vetorAuxiliar.length; i++) {
			if (vetorPrincipal)
				vetorPrincipal.push(vetorAuxiliar[i]);
		}

		//Se existir processo na fila
		if (vetorPrincipal && vetorPrincipal.length > 0) {
			if (vetorPrincipal[0].burstTimeNow > 0) {

				//Se o tempo de execução restante for maior que o ciclo
				if (vetorPrincipal[0].burstTimeNow > ciclo) {

					t += ciclo; //Adiciona um ciclo no tempo
					contador++;

					if (contador == quantum) {
						t += overload; //Adiciona uma sobrecarga
						contador = 0;
					}

					// Diminui do tempo de execução restante o valor do ciclo
					vetorPrincipal[0].burstTimeNow -= ciclo;
				}

				//Se o tempo de execução restante for menor ou igual ao ciclo
				//o último ciclo desse processo será executado
				else {
					//Aumenta o valor do tempo pelo tempo de execução que falta no processo
					t = t + vetorPrincipal[0].burstTimeNow;
					contador = 0;
					//Define o tempo de espera do processo como o tempo atual menos o tempo de execução
					if (processes) {
						for (let i = 0; i < n; i++) {
							if (vetorPrincipal[0]) {
								if (processes[i].id == vetorPrincipal[0].id) {
									processes[i].waitingTime = t - vetorPrincipal[0].burstTime;
								}
							}
						}
					}

					//O processo foi totalmente executado, então seu tempo de execução restante é 0
					vetorPrincipal[0].burstTimeNow = 0;
					//Retira o processo executado da fila
					vetorPrincipal.shift();
					//Retira os elementos nulos do vetor
					if (vetorPrincipal) {
						vetorPrincipal = vetorPrincipal.filter(function (el) {
							return el != null;
						});
					}
					//Se o vetor principal ficou vazio após a execução
					//E todos os processos na cópia estão como 0, finaliza o loop
					//TODO if todos os elementos da cópia são iguais a zero
					if (vetorPrincipal.length == 0) {
						if (acabouProcesso(n)) {
							break;
						}
					}
				}
			}
			else {
				t++;
			}
		}
		else {
			t++;
		}
	}
}

//Condição de parada
function acabouProcesso(n) {
	var acabou = true;

	for (let i = 0; i < n; i++) {
		if (vetorCopiaProcessos[i] != 0) {
			acabou = false;
		}
	}

	return acabou;
}

// Função para calcular TAT 
const findTurnAroundTime = (processes, n) => {

	for (let i = 0; i < n; i++) {
		if (processes) {
			processes[i].turnAround = processes[i].burstTime + processes[i].waitingTime - processes[i].timeStart;
		}
	}
}

// Função para fazer o teste de estouro de deadline e calcular esse estouro
const deadlineOverFlow = (processes, n) => {

	for (let i = 0; i < n; i++) {
		if (processes) {
			if (processes[i].turnAround > processes[i].deadline) {
				processes[i].deadlineOverflow = true;
				if (processes[i].deadlineOverflow) {
					processes[i].deadlineOverflowQuant = processes[i].turnAround - processes[i].deadline;
				}
			}
		}
	}
}

// Função para calcular o tempo médio
const findavgTime = (processes, n, quantum, ciclo) => {
	let total_wt = 0, total_tat = 0;

	// Função para encontrar o tempo de espera de todos os processos
	findWaitingTime(processes, n, quantum, over, ciclo);

	// Função para encontrar o TAT de todos os processos
	findTurnAroundTime(processes, n);

	// Função para fazer o teste de estouro de deadline e calcular esse estouro
	deadlineOverFlow(processes, n);

	// Display processes along with all details
	//document.write(`Processes Burst time Waiting time Turn around time<br/>`);
	console.log(`Processes/Burst time/Waiting time/Turn around time`);

	// Calcula o tempo total de espera e o TAT total 
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
	ciclo = 1;

	let quantum = 2;


	var teste = new Processo(1, 0, 10, 4);
	var teste2 = new Processo(2, 2, 8, 6);
	var teste3 = new Processo(3, 4, 10, 7);

	let n = 3;

	var processes = new Array(n).fill(0);
	processes[0] = teste;
	processes[1] = teste2;
	processes[2] = teste3;


	findavgTime(processes, n, quantum, ciclo);
}

main();
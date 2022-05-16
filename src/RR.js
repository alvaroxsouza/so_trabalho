var over; //sobrecarga

var over, priorityEndline;

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

// Função para encontrar o tempo de espera para todos os processos
const findWaitingTime = (processes, n, quantum, overload) => {
	// Faz uma cópia do vetor de processos
	priorityEndline = new Array(n).fill(0);
	for (let i = 0; i < n; i++)
		priorityEndline[i] = processes[i];
	
	priorityEndline.sort(function (a, b) { //ordenando pelo deadline de cada processo
		if (a.timeStart > b.timeStart) {
			return 1;
		}
		if (a.timeStart < b.timeStart) {
			return -1;
		}
		return 0;
	});

	let t = 0; // Current time

// Continua percorrendo os processos de maneira round robin até que todos eles estejam completos
	while (1) {
		let done = true;

		// Percorre todos os processos um por um repetidamente
		for (let i = 0; i < n; i++) {
			//tempo atual maior ou igual o tempo de chegada
			if(t >= priorityEndline[i].timeStart){
				// Se o tempo de execução de um processo for maior que 0
				// então precisa processar mais
				if (priorityEndline[i].burstTimeNow > 0) {
					done = false; // Existe um processo pendente
	
					if (priorityEndline[i].burstTimeNow > quantum) {
						// Aumenta o valor de t, ou seja, mostra quanto tempo um processo foi processado
						t += quantum;
						t += overload; // adcionando tempo de sobrecarga
	
						// Diminui o tempo de execução do processo atual
						priorityEndline[i].burstTimeNow -= quantum;
					}
	
					// Se o tempo de execução for menor ou igual ao quantum. 
					// Último ciclo para este processo
					else {
						// Aumenta o valor de t, ou seja, mostra quanto tempo um processo foi processado
						t = t + priorityEndline[i].burstTimeNow;
						
						// O tempo de espera é o tempo atual menos o tempo usado por este processo
						priorityEndline[i].waitingTime = t - priorityEndline[i].burstTime;
	
						// À medida que o processo é totalmente executado faz seu tempo de execução restante = 0
						priorityEndline[i].burstTimeNow = 0;
					}
				}
			}
			//se nenhum processo for executado adiciona 1 ao tempo 
			else if (i == n-1) { 
				t++;

			}
		}
		// Se todos os processos forem concluídos
		if (done == true)
			break;
	}
}

// Função para calcular turn around time
const findTurnAroundTime = (n) => {
	for (let i = 0; i < n; i++)
	//tempo no processador = tempo de execução + tempo de espera - tempo de chegada
	priorityEndline[i].turnAround = priorityEndline[i].burstTime + priorityEndline[i].waitingTime - priorityEndline[i].timeStart; 
}

// Função para calcular o tempo médio
const findavgTime = (processes, n, quantum) => {
	let total_wt = 0, total_tat = 0;

	// Função para encontrar o tempo de espera de todos os processos
	findWaitingTime(processes, n, quantum, over);

	// Função para encontrar turn around time de todos os processos
	findTurnAroundTime(n);

	console.log(`Processes/Burst time/Waiting time/Turn around time`);

	// Calcular o tempo total de espera e o total turn around time
	for (let i = 0; i < n; i++) {
		total_wt = total_wt + priorityEndline[i].waitingTime;
		total_tat = total_tat + priorityEndline[i].turnAround;

		//document.write(`${i + 1} ${bt[i]} ${wt[i]} ${tat[i]}<br/>`);
		console.log(`${priorityEndline[i].id} ${priorityEndline[i].burstTime} ${priorityEndline[i].waitingTime} ${priorityEndline[i].turnAround}`);
	}

	console.log(`Average waiting time = ${total_wt / n}`);
	//document.write(`Average waiting time = ${total_wt / n}`);
	console.log(`Average turn around time = ${total_tat / n}`);
	//document.write(`<br/>Average turn around time = ${total_tat / n}`);
	console.log(priorityEndline)
}

function main() {
	
	over = 1;
	// Time quantum
	let quantum = 2;
	// findavgTime(processes, n, burst_time, quantum, over, timeStart);

	var teste = new Processo(1, 0, 10);
	var teste2 = new Processo(2, 3, 5);
	var teste3 = new Processo(3, 2, 8);

	let n = 3;

	var processes = new Array(n).fill(0);
	processes[0] = teste;
	processes[1] = teste2;
	processes[2] = teste3;

	findavgTime(processes, n, quantum);
}

main();


// Test Setup
import { Processo } from "./Processo.js";

// Função para encontrar o tempo de espera para todos os processos
const findWaitingTime = (listaDeProcessos, quantidadeDeProcessos, quantum, overload) => {
	let aux = {
		indice: -1,
		controle: false
	}
	let listaDeRetangulos = [];
	// Vetor de processos
	var priorityEndline = new Array(quantidadeDeProcessos).fill(0);
	for (let i = 0; i < quantidadeDeProcessos; i++)
		priorityEndline[i] = listaDeProcessos[i];
	
	priorityEndline.sort(function (a, b) { //ordenando pelo deadline de cada processo
		if (a.tempoDeChegada > b.tempoDeChegada) {
			return 1;
		}
		if (a.tempoDeChegada < b.tempoDeChegada) {
			return -1;
		}
		return 0;
	});

	let tempoCorrente = 0; // Current time

	//Continua percorrendo os processos de maneira round robin até que todos eles estejam completos
	while (1) {
		let acabou = true;
		// Percorre todos os processos um por um repetidamente
		for (let i = 0; i < quantidadeDeProcessos; i++) {
			//tempo atual maior ou igual o tempo de chegada
			if(tempoCorrente >= priorityEndline[i].tempoDeChegada){
				let retangulo = {
					id: priorityEndline[i].id,
					tempoInicial: tempoCorrente,
					tempoFinal: 0
				}
				// Se o tempo de execução de um processo for maior que 0
				// então precisa processar mais
				if (priorityEndline[i].tempoDeExecucaoAtual > 0) {
					acabou = false; // Existe um processo pendente
	
					if (priorityEndline[i].tempoDeExecucaoAtual > quantum) {
						// Aumenta o valor de t, ou seja, mostra quanto tempo um processo foi processado
						tempoCorrente += quantum;
						tempoCorrente += overload; // adcionando tempo de sobrecarga
	
						// Diminui o tempo de execução do processo atual
						priorityEndline[i].tempoDeExecucaoAtual -= quantum;
						retangulo.tempoFinal = tempoCorrente;
        				listaDeRetangulos.push(retangulo)
					}
	
					// Se o tempo de execução for menor ou igual ao quantum. 
					// Último ciclo para este processo
					else {
						// Aumenta o valor de t, ou seja, mostra quanto tempo um processo foi processado
						tempoCorrente = tempoCorrente + priorityEndline[i].tempoDeExecucaoAtual;
						
						// O tempo de espera é o tempo atual menos o tempo usado por este processo
						priorityEndline[i].tempoDeEspera = tempoCorrente - priorityEndline[i].tempoDeExecucao;
	
						// À medida que o processo é totalmente executado faz seu tempo de execução restante = 0
						priorityEndline[i].tempoDeExecucaoAtual = 0;
						retangulo.tempoFinal = tempoCorrente;
        				listaDeRetangulos.push(retangulo)
					}
				}
			}
			//se nenhum processo for executado adiciona 1 ao tempo 
			else if (i == quantidadeDeProcessos-1) {
				if (!aux["controle"]){
					aux["indice"] = i;
					aux["controle"] = true;
				}
				else if (aux["indice"] == i){
					aux["indice"] = -1;
					aux["controle"] = true;
					tempoCorrente++;
				}
			}
		}
		// Se todos os processos forem concluídos
		if (acabou == true)
			break;
	}
	console.log(listaDeRetangulos);
}

// Função para calcular turn around time
const findTurnAroundTime = (quantidadeDeProcessos) => {
	for (let i = 0; i < quantidadeDeProcessos; i++)
		//tempo no processador = tempo de execução + tempo de espera - tempo de chegada
		priorityEndline[i].turnAround = priorityEndline[i].tempoDeExecucao + priorityEndline[i].tempoDeEspera - priorityEndline[i].tempoDeChegada; 
}

// Função para calcular o tempo médio
const findavgTime = (listaDeProcessos, quantidadeDeProcessos, quantum) => {
	let total_wt = 0, total_tat = 0;

	// Função para encontrar o tempo de espera de todos os processos
	findWaitingTime(listaDeProcessos, quantidadeDeProcessos, quantum, over);

	// Função para encontrar turn around time de todos os processos
	findTurnAroundTime(quantidadeDeProcessos);

	console.log(`listaDeProcessos/Burst time/Waiting time/Turn around time`);

	// Calcular o tempo total de espera e o total turn around time
	for (let i = 0; i < quantidadeDeProcessos; i++) {
		total_wt = total_wt + priorityEndline[i].tempoDeEspera;
		total_tat = total_tat + priorityEndline[i].turnAround;

		//document.write(`${i + 1} ${bt[i]} ${wt[i]} ${tat[i]}<br/>`);
		console.log(`${priorityEndline[i].id} ${priorityEndline[i].tempoDeExecucao} ${priorityEndline[i].tempoDeEspera} ${priorityEndline[i].turnAround}`);
	}

	console.log(`Average waiting time = ${total_wt / quantidadeDeProcessos}`);
	//document.write(`Average waiting time = ${total_wt / n}`);
	console.log(`Average turn around time = ${total_tat / quantidadeDeProcessos}`);
	//document.write(`<br/>Average turn around time = ${total_tat / n}`);
	console.log(priorityEndline)
}

function main() {
	let over = 1;
	// Time quantum
	let quantum = 2;
	// findavgTime(listaDeProcessos, n, burst_time, quantum, over, tempoDeChegada);

	var teste = new Processo(1, 0, 10);
	var teste2 = new Processo(2, 12, 5);
	var teste3 = new Processo(3, 2, 8);

	let n = 3;

	var listaDeProcessos = new Array(n).fill(0);
	listaDeProcessos[0] = teste;
	listaDeProcessos[1] = teste2;
	listaDeProcessos[2] = teste3;

	findWaitingTime(listaDeProcessos, n, quantum, 1);
}

main();


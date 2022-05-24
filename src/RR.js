// Test Setup
import { Processo } from "./Processo.js";

// Função para encontrar o tempo de espera para todos os processos
// Retorna a lista de rentagulas e a lista de processos
// Chamar primeiro esse método para pegar lista de retangulos
const findWaitingTime = (listaDeProcessos, quantum, overload) => {
	let quantidadeDeProcessos = listaDeProcessos.length;
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
	let controleTempo = false;
	let foiReordenado = false;
	//Continua percorrendo os processos de maneira round robin até que todos eles estejam completos
	while (1) {
		let acabou = true;
		// Percorre todos os processos um por um repetidamente
		for (let i = 0; i < quantidadeDeProcessos; i++) {
			//tempo atual maior ou igual o tempo de chegada
			if(tempoCorrente >= priorityEndline[i].tempoDeChegada){
				if(controleTempo){
					tempoCorrente+=1;
					controleTempo = false;
				}
				let retangulo = {
					id: priorityEndline[i].id,
					tempoInicial: tempoCorrente,
					tempoFinal: 0
				}
				// Se o tempo de execução de um processo for maior que 0
				// então precisa processar mais
				if (priorityEndline[i].tempoDeExecucaoAtual > 0) {
					if(aux["controle"]){
						aux["indice"] = -1;
						aux["controle"] = false;
					}
					acabou = false; // Existe um processo pendente
	
					if (priorityEndline[i].tempoDeExecucaoAtual > quantum) {
						// Aumenta o valor de t, ou seja, mostra quanto tempo um processo foi processado
						tempoCorrente += quantum;
						tempoCorrente += overload; // adcionando tempo de sobrecarga
	
						// Diminui o tempo de execução do processo atual
						priorityEndline[i].tempoDeExecucaoAtual -= quantum;
						retangulo.tempoFinal = tempoCorrente;
        				listaDeRetangulos.push(retangulo);
						//mudança do tempo para controle manual da inserção de um novo elemento
						controleTempo = true;
						tempoCorrente-=1;
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
			else {
				if (!aux["controle"]){
					aux["indice"] = i;
					aux["controle"] = true;
				}
				else if (aux["indice"] == i){
					aux["indice"] = -1;
					aux["controle"] = false;
					tempoCorrente++;
				}
			}
		}
		// Se todos os processos forem concluídos
		if (acabou == true)
			break;

		if(!foiReordenado){
			priorityEndline.sort(function (a, b) { //ordenando pelo deadline de cada processo
				if (a.id > b.id) {
					return 1;
				}
				if (a.id < b.id) {
					return -1;
				}
				return 0;
			});
			foiReordenado = true;
		}
	}
	let listasRentaguloEndline = {
		listaDeRetangulos: listaDeRetangulos,
		priorityEndline: priorityEndline
	}
	return listasRentaguloEndline;
}

// Função para calcular turn around time
const findTurnAroundTime = (quantidadeDeProcessos, priorityEndline) => {
	for (let i = 0; i < quantidadeDeProcessos; i++){
		if(priorityEndline)
			//tempo no processador = tempo de execução + tempo de espera - tempo de chegada
			priorityEndline[i].turnAround = priorityEndline[i].tempoDeExecucao + priorityEndline[i].tempoDeEspera - priorityEndline[i].tempoDeChegada; 
	}
		
}

// Função para calcular o tempo médio
const findavgTime = (listaDeProcessos, quantum, over) => {
	let quantidadeDeProcessos = listaDeProcessos.length;

	let total_wt = 0, total_tat = 0;

	// Função para encontrar o tempo de espera de todos os processos
	let priorityEndline = findWaitingTime(listaDeProcessos, quantum, over).priorityEndline;

	// Função para encontrar turn around time de todos os processos
	findTurnAroundTime(quantidadeDeProcessos, priorityEndline);

	// Calcular o tempo total de espera e o total turn around time
	for (let i = 0; i < quantidadeDeProcessos; i++) {
		total_wt = total_wt + priorityEndline[i].tempoDeEspera;
		total_tat = total_tat + priorityEndline[i].turnAround;
	}

	let valorWtTat = {
		Wt: (total_wt / quantidadeDeProcessos),
		Tat: (total_tat / quantidadeDeProcessos)
	}

	return valorWtTat;
}
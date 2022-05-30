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
						var retanguloSobrecarga = { //retangulo para imprimir sobrecarga
							id: -1,
							tempoInicial: 0,
							tempoFinal: 0
						}

						// Aumenta o valor de t, ou seja, mostra quanto tempo um processo foi processado
						tempoCorrente += quantum;
						// Defini tempo inicial do retangulo de sobrecarga
						retanguloSobrecarga.tempoInicial = tempoCorrente;
						// Defini tempo final do retangulo do processo atual 
						retangulo.tempoFinal = tempoCorrente;
						// Adcionando tempo de sobrecarga
						tempoCorrente += overload; 
						// Defini tempo final do retangulo de sobrecarga
						retanguloSobrecarga.tempoFinal = tempoCorrente;

	
						// Diminui o tempo de execução do processo atual
						priorityEndline[i].tempoDeExecucaoAtual -= quantum;
						
						// Adiciona o retangulo do processo atual e do de sobrecarga
        				listaDeRetangulos.push(retangulo);
						listaDeRetangulos.push(retanguloSobrecarga);

						// Mudança do tempo para controle manual da inserção de um novo elemento
						controleTempo = true;
						tempoCorrente-=1;
					}
	
					// Se o tempo de execução for menor ou igual ao quantum. 
					// Último ciclo para este processo
					else {
						// Aumenta o valor de t, ou seja, mostra quanto tempo um processo foi processado
						tempoCorrente = tempoCorrente + priorityEndline[i].tempoDeExecucaoAtual;
						
						// O tempo de espera é o tempo atual menos o tempo usado por este processo
						priorityEndline[i].tempoDeEspera = tempoCorrente - priorityEndline[i].tempoDeExecucao - priorityEndline[i].tempoDeChegada;	
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
	let retornoWt = findWaitingTime(listaDeProcessos, quantum, over);
	let priorityEndline = retornoWt.priorityEndline;
	let listaDeRetangulos = retornoWt.listaDeRetangulos;

	// Função para encontrar turn around time de todos os processos
	findTurnAroundTime(quantidadeDeProcessos, priorityEndline);

	// Calcular o tempo total de espera e o total turn around time
	for (let i = 0; i < quantidadeDeProcessos; i++) {
		total_wt = total_wt + priorityEndline[i].tempoDeEspera;
		total_tat = total_tat + priorityEndline[i].turnAround;
	}

	let valorWtTat = {
		listaDeRetangulos: listaDeRetangulos,
		Wt: (total_wt / quantidadeDeProcessos),
		Tat: (total_tat / quantidadeDeProcessos)
	}

	return valorWtTat;
}

function main() {
	let n = 3;

	let quantum = 2;
	let over = 1;

	var teste = new Processo(1, 0, 4);
	var teste2 = new Processo(2, 2, 6);
	var teste3 = new Processo(3, 4, 7);

	var listaDeProcessos = new Array(n).fill(0);
	listaDeProcessos[0] = teste;
	listaDeProcessos[1] = teste2;
	listaDeProcessos[2] = teste3;

	let retorno = findavgTime(listaDeProcessos, quantum, over);
	console.log("Lista de retângulos:")
	console.log(retorno.listaDeRetangulos)
	console.log("TAT:")
	console.log(retorno.Tat);
	console.log("WT:")
	console.log(retorno.Wt);
}

main();
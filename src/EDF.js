var over, priorityEndline;

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

// Function to find the waiting time for all
// processes
const findWaitingTime = (processes, n, quantum, overload) => {
	priorityEndline = new Array(n).fill(0); //vetor para ordenação endline
	for (let i = 0; i < n; i++) //faz uma cópia da lista de processos
		priorityEndline[i] = processes[i];

	priorityEndline.sort(function (a, b) { //sort para ordenar pelo endline
		if (a.deadline > b.deadline) {
		  return 1;
		}
		if (a.deadline < b.deadline) {
		  return -1;
		}
		return 0;
	  });

	let t = 0; // Current time

	let control = 0;
	// Keep traversing processes in round robin manner
	// until all of them are not done.
	while (1) {
		if (priorityEndline[control].timeStart >= t) { 
			// If burst time of a process is greater than 0
			// then only need to process further
			if (priorityEndline[control].burstTimeNow > 0) {
				done = false; // There is a pending process

				if (priorityEndline[control].burstTimeNow > quantum) {
					// Increase the value of t i.e. shows
					// how much time a process has been processed
					t += quantum;
					t += overload;

					// Decrease the burst_time of current process
					// by quantum
					priorityEndline[control].burstTimeNow -= quantum;
				}

				// If burst time is smaller than or equal to
				// quantum. Last cycle for this process
				else {
					// Increase the value of t i.e. shows
					// how much time a process has been processed
					t = t + priorityEndline[control].burstTimeNow;

					// Waiting time is current time minus time
					// used by this process
					priorityEndline[control].waitingTime = t - priorityEndline[control].burstTime;

					// As the process gets fully executed
					// make its remaining burst time = 0
					priorityEndline[control].burstTimeNow = 0;

					control++;
				}
			}
		}
		else{
			t++;
		}
		console.log("control: " + control + " n: " + n);
		// If all processes are done
		if (control > n)
			break;
	}
}

// Function to calculate turn around time
const findTurnAroundTime = (n) => {
	// calculating turnaround time by adding
	// bt[i] + wt[i]
	for (let i = 0; i < n; i++)
		priorityEndline[i].turnAround = priorityEndline[i].burstTime + priorityEndline[i].waitingTime - priorityEndline[i].timeStart;
}

// Function to calculate average time
const findavgTime = (processes, n, quantum) => {
	let total_wt = 0, total_tat = 0;

	// Function to find waiting time of all processes
	findWaitingTime(processes, n, quantum, over);

	// Function to find turn around time for all processes
	findTurnAroundTime(n);

	// Display processes along with all details
	//document.write(`Processes Burst time Waiting time Turn around time<br/>`);
	console.log(`Processes/Burst time/Waiting time/Turn around time`);

	// Calculate total waiting time and total turn
	// around time
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
	// Driver code
	// process id's

	over = 1;
	// Time quantum
	let quantum = 2;
	// findavgTime(processes, n, burst_time, quantum, over, timeStart);

	var teste = new Processo(1, 3, 10, 2);
	var teste2 = new Processo(2, 0, 8, 6);
	var teste3 = new Processo(3, 7, 14, 4);

	let n = 3;

	var processes = new Array(n).fill(0);
	processes[0] = teste;
	processes[1] = teste2;
	processes[2] = teste3;

	findavgTime(processes, n, quantum);
}

main();
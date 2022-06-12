# Trabalho de Sistemas Operacionais - MATA53
Trabalho de SO. Escalonamento de Processos e Gerenciamento de Memória.

Alunos:

* Álvaro Souza Oliveira
* Caio Nery Matos Santos
* Carlos Mosselman Cabral Neto
* Vanessa Machado Araújo


# Para executar o projeto

Basta apenas digitar no terminal ```npm install``` para fazer o download das dependências ou baixando direto do repositório <a href="https://github.com/alvaroxsouza/so_trabalho.git"  target="_blank">Clique Aqui</a>.
Também possuímos esta mesma aplicação no GitHub-Pages. <a href="https://alvaroxsouza.github.io/so_trabalho/"  target="_blank">Clique Aqui</a>.
# Detalhes do Projeto

Possuimos as implementações de quatro algoritmos de escalonamento, os quais seguem:

* FIFO
* Round-Robin
* EDF
* SJF

Além disso possuímos as implementações de dois algoritmos de trocas de página de memória, que são listados a seguir:

* FIFO (Utilizado para executar a troca de páginas nos algoritmos de escalonamento FIFO e SJF).
* LRU (Utilizado para executar a troca de páginas nos algoritmos de escalonamento RR e EDF).

A cada execução desses algoritmos, geramos as representações que estão em forma de animação para o usuário da aplicação, na forma de um gráfico de Grant, que pode-se notar a execução dos processos e além disso o Turnaround dos processos.

As informações da parte de memória se encontram no console enquanto a animação acontece, que pode ser aberto com ``` F12 ``` na maioria dos navegadores.


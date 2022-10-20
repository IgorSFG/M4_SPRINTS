#include <iostream>
#include <string>
#include <stdio.h>

using namespace std;

// 1 -  Faça uma função que recebe uma certa medida e ajusta ela percentualmente 
// entre dois valores mínimo e máximo e retorna esse valor
float converteSensor(int medida, int x, int z)
{
	// Conversão do valor escolhido
	float medidaPercentage = 100*(medida-x)/(z-x);
	
	// Retorna o valor em porcentagem
	return medidaPercentage;
}

// 2 - Faça uma função que simule a leitura de um sensor lendo o 
// valor do teclado ao final a função retorna este valor
int leSensor(int direction)
{
	// Declaração de variável
	int medida;

	// Dependendo do valor recebido, pede a medida da direção
	if(direction == 0)
	{
    cout << "Leitura da medida para a direita: ";
	cin >> medida;
	}
	if(direction == 1)
	{
	cout << "Leitura da medida para a esquerda: ";
	cin >> medida;
	}
	if(direction == 2)
	{
    cout << "Leitura da medida para a frente: ";
	cin >> medida;
	}
	if(direction == 3)
	{
    cout << "Leitura da medida para a tras: ";
	cin >> medida;
	}

	// Retorna o valor lido
	return medida;
}

// 3 - Faça uma função que armazena uma medida inteira qualquer 
// em um vetor fornecido. Note que como C não possui vetores 
// nativos da linguagem, lembre-se que você precisa passar o 
// valor máximo do vetor assim como a última posição preenchida
// Evite também que, por acidente, um valor seja escrito em 
// uma área de memória fora do vetor
int armazenaVetor(int medida, int lastVetor, int *v, int vetorSize)
{
	// Declaração da variável
	int *vetor = v;

	// Coloca o valor na posição ordenada do vetor
	vetor[lastVetor] = medida;
	
	// Retorna a próxima posição do vetor
	return lastVetor+1;
}



// 4 - Faça uma função que recebe um vetor com 4 posições que contém 
// o valor da distância de um pequeno robô até cada um dos seus 4 lados.
// A função deve retornar duas informações: A primeira é a direção 
// de maior distância ("Direita", "Esquerda", "Frente", "Tras") e a 
// segunda é esta maior distância.
char* direcaoMaiorCaminho(int *vetor, int *maxVetor)
{
	// Declaração de variáveis
	char* direction[] = {"Direita", "Esquerda", "Frente", "Tras"};
	int id;

	// Checa o valor em cada uma das direções
	for (int i=0; i<4; i++)
	{
		// Seleciona o maior valor entre as direções
		if(vetor[i] > *maxVetor)
		{
			*maxVetor = vetor[i];
			id = i;
		}
	}
	// Retorna a direção do maior valor
	return direction[id];
}



// 5 - Faça uma função que pergunta ao usuário se ele deseja continuar o mapeamento e 
// retorna verdadeiro ou falso
int leComando()
{	
	// Declaração de variáveis
	char resposta;
	int mapping;

	// Pede a continuação do mapeamento
	cout << "Deseja continuar o mapeamento? (Y/n): ";
	cin >> resposta;

	// Dependendo do caractere (y ou n), continua, o mapeamento
	if(resposta == 'Y' || resposta == 'y') mapping = 1;
	else if(resposta == 'N' || resposta == 'n') mapping = 0;

	// Retorna positivo ou negativo a continuação do mapeamento
	return mapping;
}


// 6 - A função abaixo (que está incompleta) vai "dirigindo" virtualmente um robô 
// e através de 4 sensores em cada um dos 4 pontos do robo ("Direita", "Esquerda", 
// "Frente", "Tras"). 
//      A cada passo, ele verifica as distâncias aos objetos e vai mapeando o terreno 
// para uma movimentação futura. 
//      Ele vai armazenando estas distancias em um vetor fornecido como parâmetro 
// e retorna a ultima posicao preenchida do vetor.
//      Esta função deve ir lendo os 4 sensores até que um comando de pare seja enviado 
//
//      Para simular os sensores e os comandos de pare, use as funções já construídas 
// nos ítens anteriores e em um looping contínuo até que um pedido de parada seja 
// enviado pelo usuário. 
//
//      Complete a função com a chamada das funções já criadas
int dirige(int *v,int maxv){
	// Declaração de variáveis
	int maxVetor = maxv;
	int *vetorMov = v;
	int posAtualVetor = 0;
	int dirigindo = 1;
	int medida;
	int direction;

	// Repete as funções enquanto for desejável
	while(dirigindo){
		// Chama as funções para cada direção (leitura, converção e armazenamento do vetor)
		for(int i=0; i<4; i++)
		{
		medida = leSensor(i);
		medida = converteSensor(medida,0,830);
		posAtualVetor = armazenaVetor(medida, posAtualVetor, vetorMov, maxVetor);
		}

		// Pergunta ao usuário se continua o mapeamento
		dirigindo = leComando();		
	}
	// Retorna a posição do valor no vetor
	return posAtualVetor;
}


// O trecho abaixo irá utilizar as funções acima para ler os sensores e o movimento
// do robô e no final percorrer o vetor e mostrar o movimento a cada direção baseado 
// na maior distância a cada movimento
void percorre(int *v,int tamPercorrido){		
	int *vetorMov = v;
	int maiorDir = 0;
	
	for(int i = 0; i< tamPercorrido; i+=4){
		char *direcao = direcaoMaiorCaminho(&(vetorMov[i]), &maiorDir);
		printf("Movimentando para %s distancia = %i%\n", direcao, maiorDir);
	}
}

int main(int argc, char** argv) {
	int maxVetor = 100;
	int vetorMov[maxVetor*4];
	int posAtualVet = 0;
	
	posAtualVet = dirige(vetorMov,maxVetor);
	percorre(vetorMov,posAtualVet);
	
	return 0;
}
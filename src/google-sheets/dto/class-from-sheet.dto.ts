export class ClassFromSheetDto {
  id: number;
  great_topic_id: number;
  front: number; // {1,2,3}
  great_topic_name: string;
  topic_name: string;
  class_name: string;
  relevance: number;
  percentage: string;
  total: number;

  constructor(index: number, sheetRow: any[]) {
    const [
      great_topic_id,
      front,
      great_topic_name,
      topic_name,
      class_name,
      relevance,
      percentage,
      total,
    ] = sheetRow;

    this.id = index; // Definindo o ID diretamente
    this.great_topic_id = great_topic_id;
    this.front = this.getFront(front); // Usando um método para converter o valor de 'front'
    this.great_topic_name = great_topic_name;
    this.topic_name = topic_name;
    this.class_name = class_name;
    this.relevance = this.getRelevance(relevance); // Usando um método para converter o valor de 'relevance'
    this.percentage = percentage;
    this.total = total;
  }

  private getFront(front: string): number {
    // Método para converter o valor de 'front' para um número
    const frontDictionary: { [key: string]: number } = {
      'Frente A': 1,
      'Frente B': 2,
      'Frente C': 3,
    };
    return frontDictionary[front];
  }

  private getRelevance(relevance: string): number {
    // Método para converter o valor de 'relevance' para um número
    const relevanceDictionary: { [key: string]: number } = {
      NEN: 0,
      BAI: 1,
      MED: 2,
      ALT: 3,
    };
    return relevanceDictionary[relevance];
  }
}

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
    const frontDictionary = {
      'Frente A': 1,
      'Frente B': 2,
      'Frente C': 3,
    };

    const relevanceDictionary = {
      NEN: 0,
      BAI: 1,
      MED: 2,
      ALT: 3,
      SALT: 4,
    };

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
    this.front = frontDictionary[front]; // Usando um método para converter o valor de 'front'
    this.great_topic_name = great_topic_name;
    this.topic_name = topic_name;
    this.class_name = class_name;
    this.relevance = relevanceDictionary[relevance]; // Usando um método para converter o valor de 'relevance'
    this.percentage = percentage;
    this.total = total;
  }
}

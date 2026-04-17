// Brazilian states + cities >500k inhabitants + top 20 mocked neighborhoods per city.
// Used by RequestForm for the Estado → Cidade → Bairro cascading selects.

export interface BrazilState {
  uf: string;
  name: string;
}

export const BRAZIL_STATES: BrazilState[] = [
  { uf: "AC", name: "Acre" },
  { uf: "AL", name: "Alagoas" },
  { uf: "AP", name: "Amapá" },
  { uf: "AM", name: "Amazonas" },
  { uf: "BA", name: "Bahia" },
  { uf: "CE", name: "Ceará" },
  { uf: "DF", name: "Distrito Federal" },
  { uf: "ES", name: "Espírito Santo" },
  { uf: "GO", name: "Goiás" },
  { uf: "MA", name: "Maranhão" },
  { uf: "MT", name: "Mato Grosso" },
  { uf: "MS", name: "Mato Grosso do Sul" },
  { uf: "MG", name: "Minas Gerais" },
  { uf: "PA", name: "Pará" },
  { uf: "PB", name: "Paraíba" },
  { uf: "PR", name: "Paraná" },
  { uf: "PE", name: "Pernambuco" },
  { uf: "PI", name: "Piauí" },
  { uf: "RJ", name: "Rio de Janeiro" },
  { uf: "RN", name: "Rio Grande do Norte" },
  { uf: "RS", name: "Rio Grande do Sul" },
  { uf: "RO", name: "Rondônia" },
  { uf: "RR", name: "Roraima" },
  { uf: "SC", name: "Santa Catarina" },
  { uf: "SP", name: "São Paulo" },
  { uf: "SE", name: "Sergipe" },
  { uf: "TO", name: "Tocantins" },
];

// Cidades brasileiras com mais de 500 mil habitantes (estimativa IBGE)
// Bairros: top 20 mockados por cidade. Cidades sem mock detalhado caem em DEFAULT_NEIGHBORHOODS.
export const CITIES_BY_STATE: Record<string, string[]> = {
  AC: ["Rio Branco"],
  AP: ["Macapá"],
  AM: ["Manaus"],
  PA: ["Belém", "Ananindeua"],
  MA: ["São Luís"],
  CE: ["Fortaleza", "Caucaia"],
  RN: ["Natal"],
  PB: ["João Pessoa"],
  PE: ["Recife", "Jaboatão dos Guararapes"],
  AL: ["Maceió"],
  BA: ["Salvador", "Feira de Santana"],
  SE: ["Aracaju"],
  PI: ["Teresina"],
  DF: ["Brasília"],
  GO: ["Goiânia", "Aparecida de Goiânia"],
  MT: ["Cuiabá"],
  MS: ["Campo Grande"],
  MG: ["Belo Horizonte", "Uberlândia", "Contagem", "Juiz de Fora", "Betim"],
  ES: ["Vitória", "Serra", "Vila Velha", "Cariacica"],
  RJ: ["Rio de Janeiro", "São Gonçalo", "Duque de Caxias", "Nova Iguaçu", "Niterói", "Belford Roxo", "São João de Meriti", "Campos dos Goytacazes"],
  SP: [
    "São Paulo", "Guarulhos", "Campinas", "São Bernardo do Campo", "Santo André",
    "Osasco", "São José dos Campos", "Ribeirão Preto", "Sorocaba", "Mauá", "São José do Rio Preto",
  ],
  PR: ["Curitiba", "Londrina", "Maringá"],
  SC: ["Florianópolis", "Joinville"],
  RS: ["Porto Alegre", "Caxias do Sul"],
  RO: ["Porto Velho"],
  RR: ["Boa Vista"],
  TO: ["Palmas"],
};

// Bairros mockados (top 20) para algumas grandes cidades.
// Cidades sem entrada explícita retornam apenas a opção "Outros".
export const OTHER_NEIGHBORHOOD = "Outros";

const NEIGHBORHOODS_BY_CITY: Record<string, string[]> = {
  "São Luís": [
    "Altos do Calhau", "Angelim", "Araçagy", "Bequimão", "Calhau",
    "Cidade Operária", "Cohab", "Cohama", "Cohatrac", "Forquilha",
    "Ipase", "Jardim Eldorado", "Jardim São Cristóvão", "Maiobão", "Monte Castelo",
    "Olho D'Água", "Ponta D'Areia", "Renascença", "Sacavém", "Turu",
  ],
  "São Paulo": [
    "Moema", "Vila Mariana", "Pinheiros", "Vila Madalena", "Itaim Bibi",
    "Jardins", "Morumbi", "Tatuapé", "Mooca", "Santana",
    "Brooklin", "Perdizes", "Higienópolis", "Bela Vista", "Liberdade",
    "Vila Olímpia", "Campo Belo", "Saúde", "Lapa", "Butantã",
  ],
  "Rio de Janeiro": [
    "Copacabana", "Ipanema", "Leblon", "Botafogo", "Flamengo",
    "Tijuca", "Barra da Tijuca", "Recreio dos Bandeirantes", "Jacarepaguá", "Méier",
    "Vila Isabel", "Laranjeiras", "Humaitá", "Gávea", "Lagoa",
    "Centro", "Santa Teresa", "Urca", "São Conrado", "Grajaú",
  ],
  "Belo Horizonte": [
    "Savassi", "Funcionários", "Lourdes", "Buritis", "Belvedere",
    "Pampulha", "Cidade Nova", "Santa Tereza", "Sion", "Anchieta",
    "Cruzeiro", "Serra", "Santo Agostinho", "Centro", "Barreiro",
    "Castelo", "Carlos Prates", "Floresta", "Gutierrez", "Mangabeiras",
  ],
  "Brasília": [
    "Asa Sul", "Asa Norte", "Lago Sul", "Lago Norte", "Sudoeste",
    "Noroeste", "Águas Claras", "Taguatinga", "Ceilândia", "Guará",
    "Cruzeiro", "Octogonal", "Park Way", "Jardim Botânico", "Vicente Pires",
    "Sobradinho", "Gama", "Samambaia", "Recanto das Emas", "Planaltina",
  ],
  "Fortaleza": [
    "Aldeota", "Meireles", "Cocó", "Mucuripe", "Praia de Iracema",
    "Varjota", "Dionísio Torres", "Joaquim Távora", "Fátima", "Centro",
    "Papicu", "Cambeba", "Edson Queiroz", "Sapiranga", "Messejana",
    "Parquelândia", "Benfica", "Montese", "Parangaba", "Maraponga",
  ],
  "Salvador": [
    "Barra", "Pituba", "Itaigara", "Caminho das Árvores", "Graça",
    "Vitória", "Ondina", "Rio Vermelho", "Stiep", "Costa Azul",
    "Imbuí", "Patamares", "Piatã", "Itapuã", "Brotas",
    "Federação", "Canela", "Nazaré", "Centro", "Pelourinho",
  ],
  "Curitiba": [
    "Batel", "Água Verde", "Bigorrilho", "Centro", "Cabral",
    "Mercês", "Champagnat", "Ecoville", "Juvevê", "Alto da XV",
    "Rebouças", "Portão", "Boa Vista", "Cristo Rei", "Hugo Lange",
    "Jardim das Américas", "Bacacheri", "Santa Felicidade", "Pinheirinho", "Boqueirão",
  ],
  "Porto Alegre": [
    "Moinhos de Vento", "Bela Vista", "Petrópolis", "Menino Deus", "Bom Fim",
    "Auxiliadora", "Centro Histórico", "Cidade Baixa", "Higienópolis", "Independência",
    "Jardim Botânico", "Mont'Serrat", "Rio Branco", "Tristeza", "Ipanema",
    "Cavalhada", "Partenon", "Cristal", "Praia de Belas", "Floresta",
  ],
  "Recife": [
    "Boa Viagem", "Pina", "Casa Forte", "Graças", "Espinheiro",
    "Aflitos", "Madalena", "Torre", "Parnamirim", "Tamarineira",
    "Rosarinho", "Encruzilhada", "Boa Vista", "Derby", "Ilha do Leite",
    "Casa Amarela", "Várzea", "Cordeiro", "Imbiribeira", "Setúbal",
  ],
  "Manaus": [
    "Adrianópolis", "Aleixo", "Centro", "Chapada", "Cidade Nova",
    "Compensa", "Coroado", "Dom Pedro", "Flores", "Japiim",
    "Nossa Senhora das Graças", "Parque 10 de Novembro", "Petrópolis", "Ponta Negra", "Praça 14 de Janeiro",
    "Redenção", "São Geraldo", "São Jorge", "Tarumã", "Vieiralves",
  ],
  "Belém": [
    "Batista Campos", "Campina", "Cidade Velha", "Cremação", "Fátima",
    "Guamá", "Jurunas", "Marco", "Nazaré", "Pedreira",
    "Reduto", "Sacramenta", "São Brás", "Telégrafo", "Terra Firme",
    "Umarizal", "Val-de-Cans", "Marambaia", "Souza", "Curió-Utinga",
  ],
  "Ananindeua": [
    "Centro", "Cidade Nova", "Coqueiro", "Distrito Industrial", "Águas Brancas",
    "Águas Lindas", "Atalaia", "Geraldo Palmeira", "Guajará", "Icuí-Guajará",
    "Jaderlândia", "Júlia Seffer", "Maguari", "Paar", "Providência",
    "Souza Franco", "Tapanã", "Una", "Verdejante", "40 Horas",
  ],
  "Caucaia": [
    "Centro", "Araturi", "Cumbuco", "Genibaú", "Icaraí",
    "Jurema", "Marechal Rondon", "Metrópole", "Nova Metrópole", "Pabussu",
    "Parque Albano", "Parque Potira", "Parque Soledade", "Planalto", "Tabapuá",
    "Tabuba", "Tucunduba", "Vila Velha", "Capuan", "Garrote",
  ],
  "Natal": [
    "Alecrim", "Areia Preta", "Barro Vermelho", "Candelária", "Capim Macio",
    "Cidade Alta", "Cidade Verde", "Lagoa Nova", "Lagoa Seca", "Mãe Luiza",
    "Neópolis", "Nova Descoberta", "Petrópolis", "Pirangi", "Pitimbu",
    "Ponta Negra", "Praia do Meio", "Ribeira", "Rocas", "Tirol",
  ],
  "João Pessoa": [
    "Altiplano Cabo Branco", "Bancários", "Bessa", "Brisamar", "Cabo Branco",
    "Castelo Branco", "Centro", "Cristo Redentor", "Expedicionários", "Jaguaribe",
    "Jardim Oceania", "Manaíra", "Mangabeira", "Miramar", "Pedro Gondim",
    "Tambaú", "Tambauzinho", "Tambiá", "Torre", "Valentina Figueiredo",
  ],
  "Jaboatão dos Guararapes": [
    "Barra de Jangada", "Cajueiro Seco", "Cândeias", "Centro", "Curado",
    "Guararapes", "Jaboatão Centro", "Jardim Jordão", "Jardim Piedade", "Muribeca",
    "Pernambuco", "Piedade", "Prazeres", "Socorro", "Sucupira",
    "Vila Rica", "Cavaleiro", "Comportas", "Marcos Freire", "Massangana",
  ],
  "Maceió": [
    "Barro Duro", "Benedito Bentes", "Cidade Universitária", "Cruz das Almas", "Farol",
    "Feitosa", "Gruta de Lourdes", "Jacarecica", "Jaraguá", "Jatiúca",
    "Mangabeiras", "Pajuçara", "Pinheiro", "Poço", "Ponta Verde",
    "Ponta Grossa", "Prado", "Riacho Doce", "Serraria", "Tabuleiro do Martins",
  ],
  "Feira de Santana": [
    "Aviário", "Brasília", "Caseb", "Centro", "Cidade Nova",
    "Conceição", "Feira VII", "Gabriela", "George Américo", "Jardim Cruzeiro",
    "Kalilândia", "Mangabeira", "Muchila", "Pampalona", "Parque Getúlio Vargas",
    "Ponto Central", "Queimadinha", "Santa Mônica", "Sim", "Tomba",
  ],
  "Aracaju": [
    "Atalaia", "Aruana", "Bairro Industrial", "Centro", "Cirurgia",
    "Coroa do Meio", "Farolândia", "Getúlio Vargas", "Grageru", "Inácio Barbosa",
    "Jabotiana", "Jardins", "Luzia", "Pereira Lobo", "Ponto Novo",
    "Salgado Filho", "Santo Antônio", "São Conrado", "São José", "Treze de Julho",
  ],
  "Teresina": [
    "Centro", "Cabral", "Fátima", "Horto", "Ilhotas",
    "Jóquei", "Mafrense", "Marquês", "Matinha", "Morros",
    "Noivos", "Piçarra", "Pirajá", "Porenquanto", "Promorar",
    "Real Copagre", "Saci", "São Cristóvão", "São João", "Vermelha",
  ],
  "Goiânia": [
    "Setor Bueno", "Setor Marista", "Setor Oeste", "Setor Sul", "Setor Central",
    "Setor Aeroporto", "Setor Campinas", "Setor Universitário", "Setor Pedro Ludovico", "Jardim América",
    "Jardim Goiás", "Alto da Glória", "Bela Vista", "Park Lozandes", "Vila Nova",
    "Nova Suíça", "Cidade Jardim", "Coimbra", "Negrão de Lima", "Vila União",
  ],
  "Aparecida de Goiânia": [
    "Centro", "Cidade Vera Cruz", "Vila Brasília", "Setor Garavelo", "Jardim Tiradentes",
    "Parque Flamboyant", "Setor dos Afonsos", "Cidade Livre", "Vila Maria", "Jardim Olímpico",
    "Setor Central", "Independência Mansões", "Vila Oliveira", "Polocentro", "Vila São Tomaz",
    "Jardim Maria Inês", "Bairro Cardoso", "Buriti Sereno", "Solar Central Park", "Cardoso Continuação",
  ],
  "Cuiabá": [
    "Centro", "Centro-Norte", "Centro-Sul", "Coxipó", "Despraiado",
    "Goiabeiras", "Grande Terceiro", "Jardim Aclimação", "Jardim das Américas", "Jardim Cuiabá",
    "Jardim Itália", "Jardim Petrópolis", "Morada do Ouro", "Pico do Amor", "Poção",
    "Porto", "Quilombo", "Santa Rosa", "Verdão", "Vila Aurora",
  ],
  "Campo Grande": [
    "Centro", "Amambaí", "Bairro Itanhangá", "Carandá Bosque", "Chácara Cachoeira",
    "Coronel Antonino", "Cruzeiro", "Jardim Autonomista", "Jardim dos Estados", "Jardim Monte Líbano",
    "Jardim Paulista", "Jardim TV Morena", "Mata do Jacinto", "Monte Castelo", "Nova Lima",
    "Santa Fé", "São Francisco", "Tiradentes", "Vila Carvalho", "Vivendas do Bosque",
  ],
  "Uberlândia": [
    "Centro", "Brasil", "Cazeca", "Copacabana", "Daniel Fonseca",
    "Fundinho", "Granada", "Jaraguá", "Jardim Karaíba", "Jardim Patrícia",
    "Lídice", "Martins", "Morada da Colina", "Osvaldo Rezende", "Pampulha",
    "Patrimônio", "Saraiva", "Tabajaras", "Tibery", "Umuarama",
  ],
  "Contagem": [
    "Centro", "Eldorado", "Industrial", "Jardim Industrial", "Bandeirantes",
    "Cabral", "Cidade Industrial", "Estância Imperial", "Glória", "Inconfidentes",
    "Linda Vista", "Nacional", "Novo Eldorado", "Parque São João", "Petrolândia",
    "Riacho", "Riacho das Pedras", "Sapucaias", "Tropical", "Vila Pérola",
  ],
  "Juiz de Fora": [
    "Centro", "Cascatinha", "Cruzeiro do Sul", "Granbery", "Jardim Glória",
    "Jardim Laranjeiras", "Manoel Honório", "Mariano Procópio", "Morro da Glória", "Mundo Novo",
    "Passos", "Poço Rico", "Quintas da Avenida", "Santa Catarina", "Santa Helena",
    "Santa Luzia", "São Mateus", "São Pedro", "Teixeiras", "Vale do Ipê",
  ],
  "Betim": [
    "Centro", "Angola", "Brasileia", "Cachoeira", "Cidade Verde",
    "Citrolândia", "Cruzeiro do Sul", "Filadélfia", "Horto", "Icaivera",
    "Imbiruçu", "Ingá", "Jardim das Alterosas", "Jardim Petrópolis", "Niterói",
    "PTB", "Salvador", "São Caetano", "Teresópolis", "Vila Cristina",
  ],
  "Serra": [
    "Centro de Serra", "Jardim Limoeiro", "Laranjeiras", "Manguinhos", "Morada de Laranjeiras",
    "Nova Almeida", "Parque Residencial Laranjeiras", "Planalto Serrano", "Porto Canoa", "Serra Dourada",
    "Carapebus", "Civit II", "Colina de Laranjeiras", "Eldorado", "Jacaraípe",
    "José de Anchieta", "Maringá", "Pitanga", "São Diogo", "Valparaíso",
  ],
  "Vila Velha": [
    "Centro", "Itapuã", "Praia da Costa", "Praia de Itaparica", "Coqueiral de Itaparica",
    "Glória", "Itaparica", "Divino Espírito Santo", "Cocal", "Soteco",
    "Pontal das Garças", "Praia das Gaivotas", "Jockey de Itaparica", "Boa Vista", "Ilha dos Aires",
    "Vale Encantado", "Riviera da Barra", "São Torquato", "Cobilândia", "Aribiri",
  ],
  "Cariacica": [
    "Campo Grande", "Itaquari", "Bandeirantes", "Jardim América", "Alto Lage",
    "Vila Capixaba", "Itacibá", "Cruzeiro do Sul", "Bela Aurora", "Porto de Santana",
    "Nova Rosa da Penha", "Padre Mathias", "Santana", "São Geraldo", "Santo André",
    "Tucum", "Vasco da Gama", "Maracanã", "Cariacica Sede", "Flexal",
  ],
  "São Gonçalo": [
    "Alcântara", "Boa Vista", "Centro", "Colubandê", "Engenho do Roçado",
    "Estrela do Norte", "Galo Branco", "Jardim Catarina", "Mutondo", "Neves",
    "Paraíso", "Porto da Pedra", "Porto Velho", "Rocha", "Santa Catarina",
    "Santa Isabel", "Tribobó", "Trindade", "Vila Lage", "Zé Garoto",
  ],
  "Duque de Caxias": [
    "Centro", "Bar dos Cavaleiros", "Bonsucesso", "Campos Elíseos", "Cangulo",
    "Centenário", "Doutor Laureano", "Engenho do Porto", "Figueira", "Imbariê",
    "Jardim Anhangá", "Jardim Gramacho", "Jardim Primavera", "Olavo Bilac", "Parque Lafaiete",
    "Pilar", "Saracuruna", "Sarapuí", "Vila São Luís", "Xerém",
  ],
  "Nova Iguaçu": [
    "Centro", "Bairro da Luz", "Caioaba", "Califórnia", "Cabuçu",
    "Cerâmica", "Comendador Soares", "Da Posse", "Jardim Iguaçu", "Jardim Nova Era",
    "Jardim Palmares", "Km 32", "Miguel Couto", "Moquetá", "Nova América",
    "Ouro Verde", "Parque Flora", "Riachão", "Santa Eugênia", "Tinguazinho",
  ],
  "Niterói": [
    "Boa Viagem", "Cachoeira", "Camboinhas", "Centro", "Charitas",
    "Engenhoca", "Fonseca", "Icaraí", "Ingá", "Itacoatiara",
    "Itaipu", "Jurujuba", "Maravista", "Pendotiba", "Piratininga",
    "Santa Rosa", "São Domingos", "São Francisco", "Vital Brazil", "Várzea das Moças",
  ],
  "Belford Roxo": [
    "Centro", "Areia Branca", "Bom Pastor", "Coelho da Rocha", "Heliópolis",
    "Itaipu", "Jardim Bom Retiro", "Jardim do Ipê", "Jardim Glaucia", "Jardim Redentor",
    "Lote XV", "Nova Aurora", "Parque Amorim", "Parque Floresta", "Piam",
    "Santa Amélia", "Santa Maria", "Santa Tereza", "São Bernardo", "Vilar Novo",
  ],
  "São João de Meriti": [
    "Centro", "Agostinho Porto", "Coelho da Rocha", "Engenheiro Belford", "Éden",
    "Jardim Íris", "Jardim Maravilha", "Jardim Meriti", "Jardim Metrópole", "Jardim Sumaré",
    "Parque Alian", "Parque Analândia", "Parque Araruama", "Parque Barreto", "Parque Juriti",
    "Parque Tietê", "Tomazinho", "Venda Velha", "Vila Norma", "Vila Rosali",
  ],
  "Campos dos Goytacazes": [
    "Centro", "Aeroporto", "Caju", "Calabouço", "Custodópolis",
    "Donana", "Eldorado", "Flamboyant", "Goitacazes", "Guarus",
    "Horto", "Jardim Carioca", "Jockey", "Lapa", "Pelinca",
    "Parque Califórnia", "Parque Tamandaré", "Penha", "São Benedito", "Turf Club",
  ],
  "Guarulhos": [
    "Centro", "Bom Clima", "Cabuçu", "Cocaia", "Cumbica",
    "Gopouva", "Jardim Adriana", "Jardim Albertina", "Jardim Bela Vista", "Jardim Maia",
    "Jardim Tranquilidade", "Jardim Vila Galvão", "Macedo", "Picanço", "Ponte Grande",
    "São João", "Taboão", "Tranquilidade", "Vila Augusta", "Vila Galvão",
  ],
  "Campinas": [
    "Cambuí", "Centro", "Bonfim", "Botafogo", "Cidade Universitária",
    "Guanabara", "Jardim Chapadão", "Jardim Guanabara", "Jardim Nova Europa", "Jardim Proença",
    "Mansões Santo Antônio", "Nova Campinas", "Parque Prado", "Parque Taquaral", "Ponte Preta",
    "São Bernardo", "Sousas", "Taquaral", "Vila Industrial", "Vila Itapura",
  ],
  "São Bernardo do Campo": [
    "Centro", "Anchieta", "Assunção", "Baeta Neves", "Demarchi",
    "Ferrazópolis", "Jardim do Mar", "Jordanópolis", "Nova Petrópolis", "Paulicéia",
    "Planalto", "Riacho Grande", "Rudge Ramos", "Santa Terezinha", "São Pedro",
    "Taboão", "Vila Marlene", "Vila Marina", "Vila Vivaldi", "Vila Euclides",
  ],
  "Santo André": [
    "Centro", "Bangu", "Camilópolis", "Campestre", "Casa Branca",
    "Centreville", "Cidade São Jorge", "Jardim", "Jardim Bela Vista", "Jardim do Estádio",
    "Parque das Nações", "Parque Erasmo Assunção", "Santa Maria", "Santa Terezinha", "Utinga",
    "Vila Assunção", "Vila Bastos", "Vila Curuçá", "Vila Pires", "Vila Valparaíso",
  ],
  "Osasco": [
    "Centro", "Adalgisa", "Bandeiras", "Bela Vista", "Bonfim",
    "Cidade de Deus", "City Bussocaba", "Helena Maria", "IAPI", "Industrial Anhanguera",
    "Jaguaribe", "Jardim das Flores", "Jardim Piratininga", "Jardim Roberto", "Khalil",
    "Munhoz Júnior", "Pestana", "Presidente Altino", "Quitaúna", "Rochdale",
  ],
  "São José dos Campos": [
    "Centro", "Aquarius", "Altos do Esplanada", "Bosque dos Eucaliptos", "Campos São José",
    "Esplanada do Sol", "Jardim Aquarius", "Jardim Apolo", "Jardim das Indústrias", "Jardim Esplanada",
    "Jardim Oriente", "Jardim Satélite", "Monte Castelo", "Palmeiras de São José", "Parque Industrial",
    "Parque Residencial Aquarius", "Urbanova", "Vila Adyana", "Vila Ema", "Vista Verde",
  ],
  "Ribeirão Preto": [
    "Centro", "Alto da Boa Vista", "Bonfim Paulista", "Campos Elíseos", "City Ribeirão",
    "Iguatemi", "Jardim América", "Jardim Botânico", "Jardim Califórnia", "Jardim Canadá",
    "Jardim Irajá", "Jardim Nova Aliança", "Jardim Paulista", "Jardim Sumaré", "Nova Aliança",
    "Quintino Facci", "Ribeirânia", "Santa Cruz", "Sumarezinho", "Vila Seixas",
  ],
  "Sorocaba": [
    "Centro", "Além Ponte", "Aparecidinha", "Barcelona", "Brigadeiro Tobias",
    "Campolim", "Cidade Jardim", "Éden", "Iporanga", "Jardim Europa",
    "Jardim Vergueiro", "Jardim Saira", "Lopes de Oliveira", "Mangal", "Parque Campolim",
    "Parque São Bento", "Trujillo", "Vila Hortência", "Vila Jardini", "Wanel Ville",
  ],
  "Mauá": [
    "Centro", "Alto da Boa Vista", "Capuava", "Chácara Maria Aparecida", "Jardim Cruzeiro",
    "Jardim Itapark", "Jardim Itapeva", "Jardim Mauá", "Jardim Oratório", "Jardim Pedroso",
    "Jardim Primavera", "Jardim Sônia Maria", "Jardim Zaíra", "Matriz", "Parque das Américas",
    "Parque São Vicente", "Sertãozinho", "Vila Assis Brasil", "Vila Magini", "Vila Vitória",
  ],
  "São José do Rio Preto": [
    "Centro", "Boa Vista", "Bom Jardim", "Cidade Nova", "Eldorado",
    "Higienópolis", "Iguatemi", "Jaguaré", "Jardim Alvorada", "Jardim Americano",
    "Jardim Conceição", "Jardim Nazareth", "Jardim Tarraf", "Jardim Walkíria", "Nova Redentora",
    "Parque Industrial", "Redentora", "Santa Cruz", "Vila Imperial", "Vila Toninho",
  ],
  "Londrina": [
    "Centro", "Antares", "Aurora", "Boa Vista", "Cafezal",
    "Califórnia", "Cinco Conjuntos", "Gleba Palhano", "Igapó", "Ipiranga",
    "Jardim Bandeirantes", "Jardim Bela Suíça", "Jardim do Sol", "Jardim Higienópolis", "Jardim Petrópolis",
    "Jardim Shangri-lá", "Maria Cecília", "Quebec", "Vila Brasil", "Vila Nova",
  ],
  "Maringá": [
    "Centro", "Zona 01", "Zona 02", "Zona 03", "Zona 04",
    "Zona 05", "Zona 06", "Zona 07", "Jardim Alvorada", "Jardim Aclimação",
    "Jardim Imperial", "Jardim Internorte", "Jardim Novo Horizonte", "Jardim Universo", "Mandacaru",
    "Novo Centro", "Parque das Grevíleas", "Parque Itaipu", "Vila Esperança", "Vila Operária",
  ],
  "Joinville": [
    "Centro", "América", "Anita Garibaldi", "Atiradores", "Boa Vista",
    "Bom Retiro", "Bucarein", "Costa e Silva", "Floresta", "Glória",
    "Iririú", "Jardim Iririú", "Jardim Sofia", "Pirabeiraba", "Saguaçu",
    "Santo Antônio", "São Marcos", "Tupy", "Vila Nova", "Zona Industrial Norte",
  ],
  "Florianópolis": [
    "Centro", "Agronômica", "Balneário", "Cacupé", "Campeche",
    "Canasvieiras", "Coqueiros", "Estreito", "Ingleses", "Itacorubi",
    "Jurerê", "Jurerê Internacional", "Lagoa da Conceição", "Pantanal", "Praia Brava",
    "Ratones", "Ribeirão da Ilha", "Santa Mônica", "Saco dos Limões", "Trindade",
  ],
  "Caxias do Sul": [
    "Centro", "Ana Rech", "Bela Vista", "Cinquentenário", "Cristo Redentor",
    "Esplanada", "Exposição", "Jardelino Ramos", "Jardim América", "Lourdes",
    "Madureira", "Marechal Floriano", "Nossa Senhora da Saúde", "Panazzolo", "Pio X",
    "Planalto", "Pioneiro", "Rio Branco", "Sagrada Família", "São Pelegrino",
  ],
};

export function getCitiesByState(uf: string): string[] {
  return CITIES_BY_STATE[uf] ?? [];
}

export function getNeighborhoodsByCity(city: string): string[] {
  const list = NEIGHBORHOODS_BY_CITY[city] ?? [];
  return [...list, OTHER_NEIGHBORHOOD];
}

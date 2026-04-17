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
  ES: ["Serra", "Vila Velha", "Cariacica"],
  RJ: ["Rio de Janeiro", "São Gonçalo", "Duque de Caxias", "Nova Iguaçu", "Niterói", "Belford Roxo", "São João de Meriti", "Campos dos Goytacazes"],
  SP: [
    "São Paulo", "Guarulhos", "Campinas", "São Bernardo do Campo", "Santo André",
    "Osasco", "São José dos Campos", "Ribeirão Preto", "Sorocaba", "Mauá", "São José do Rio Preto",
  ],
  PR: ["Curitiba", "Londrina", "Maringá"],
  SC: ["Joinville", "Florianópolis"],
  RS: ["Porto Alegre", "Caxias do Sul"],
};

const DEFAULT_NEIGHBORHOODS = [
  "Centro", "Jardim América", "Vila Nova", "Boa Vista", "São José",
  "Santa Maria", "Bela Vista", "Industrial", "Cidade Nova", "Vila Mariana",
  "Jardim Europa", "Parque Industrial", "São Francisco", "Santa Cruz", "São Pedro",
  "Vila Olímpia", "Jardim Paulista", "Alto da Boa Vista", "Vila Madalena", "Morumbi",
];

// Bairros mockados (top 20) para algumas grandes cidades.
// Cidades sem entrada explícita usam DEFAULT_NEIGHBORHOODS.
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
};

export function getCitiesByState(uf: string): string[] {
  return CITIES_BY_STATE[uf] ?? [];
}

export function getNeighborhoodsByCity(city: string): string[] {
  return NEIGHBORHOODS_BY_CITY[city] ?? DEFAULT_NEIGHBORHOODS;
}

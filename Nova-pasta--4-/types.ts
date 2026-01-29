
export type ContractType = 'PF_BUNDLE' | 'PJ_BUNDLE' | 'PARTNERSHIP';
export type UserRole = 'ADVOGADO' | 'COLABORADOR';

export interface User {
  id: string;
  email: string;
  role?: UserRole;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
    oab?: string;
  };
}

export interface AttachedFile {
  name: string;
  size: number;
  type: string;
  uploadDate: string;
}

export interface PaymentRecord {
  month: number;
  year: number;
  paidAt: string;
}

export interface Client {
  id: string;
  name: string;
  document: string;
  type: 'PF' | 'PJ';
  status: 'ATIVO' | 'INATIVO';
  lastContract: string;
  registrationDate: string;
  signedDocs: AttachedFile[];
  paymentHistory: PaymentRecord[]; 
  paymentInfo?: {
    totalValue: string;
    installmentValue: string;
    installmentsCount: string;
    dueDate: string; 
    method: string;
    entryValue?: string;
    entryDate?: string;
  };
}

export interface ClientData {
  id: string;
  nome: string;
  cpf: string;
}

export interface HistoryItem {
  id: string;
  client: string;
  document?: string;
  type: string;
  date: string;
  fullData?: any;
}

export interface FormDataPF {
  nome: string;
  estadoCivil: string;
  profissao: string;
  nacionalidade: string;
  cpf: string;
  rua: string;
  complemento: string;
  cep: string;
  numProcesso: string;
  cidade: string;
  estado: string;
  data: string;
  valorTotal: string;
  entrada: string;
  dataEntrada: string;
  vezesParcelas: string;
  valorParcela: string;
  dataPagamentoParcelas: string;
  formaPagamento: string;
}

export interface FormDataPJ {
  razaoSocial: string;
  cnpj: string;
  enderecoSede: string;
  bairroSede: string;
  cidadeSede: string;
  estadoSede: string;
  cepSede: string;
  nomeRepresentante: string;
  nacionalidadeRep: string;
  profissaoRep: string;
  estadoCivilRep: string;
  cpfRep: string;
  enderecoRep: string;
  cidadeRep: string;
  estadoRep: string;
  cepRep: string;
  numProcesso: string;
  valorTotal: string;
  entrada: string;
  dataEntrada: string;
  vezesParcelas: string;
  valorParcela: string;
  dataPagamentoParcelas: string;
  formaPagamento: string;
  data: string;
}

export interface FormDataPartnership {
  gestor: string;
  parceiro: string;
  oabParceiro: string;
  clientes: ClientData[];
  tipoAcao: string;
  percentual: string;
  estadoAssinatura: string;
  dataAssinatura: string;
}

export interface AIReviewResult {
  missingFields: string[];
  inconsistencies: string[];
  recommendations: string[];
}

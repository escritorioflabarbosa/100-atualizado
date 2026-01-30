
import React from 'react';
import { Briefcase, User, Building2, Scale } from 'lucide-react';

export const CONTRACT_TEMPLATES = [
  {
    id: 'PF_BUNDLE',
    title: 'Pessoa Física',
    description: 'Honorários, Procuração e Hipossuficiência PF',
    icon: <User className="w-6 h-6" />,
    color: 'bg-blue-500'
  },
  {
    id: 'PJ_BUNDLE',
    title: 'Pessoa Jurídica',
    description: 'Contratos e Procurações para Empresas',
    icon: <Building2 className="w-6 h-6" />,
    color: 'bg-emerald-500'
  },
  {
    id: 'PARTNERSHIP',
    title: 'Parceria Jurídica',
    description: 'Contrato entre Advogados e Divisão de Honorários',
    icon: <Briefcase className="w-6 h-6" />,
    color: 'bg-indigo-500'
  }
];

export const ACTION_TYPES = [
  'Defesa em busca e apreensão',
  'Revisional',
  'Execução de título extrajudicial',
  'Criminal',
  'Família',
  'Trabalhista',
  'Indenizatório',
  'Processo civil'
];

export const PARTNER_PERCENTAGES = [
  { label: '10% a 20% — indicação / apresentação', value: '10-20' },
  { label: '30% a 50% — indicação + atuação', value: '30-50' },
  { label: 'Até 30% — suporte ou copatrocínio', value: '0-30' }
];

export const BRAZIL_STATES = [
  'Acre', 'Alagoas', 'Amapá', 'Amazonas', 'Bahia', 'Ceará', 'Distrito Federal', 'Espírito Santo', 'Goiás', 'Maranhão', 'Mato Grosso', 'Mato Grosso do Sul', 'Minas Gerais', 'Pará', 'Paraíba', 'Paraná', 'Pernambuco', 'Piauí', 'Rio de Janeiro', 'Rio Grande do Norte', 'Rio Grande do Sul', 'Rondônia', 'Roraima', 'Santa Catarina', 'São Paulo', 'Sergipe', 'Tocantins'
];

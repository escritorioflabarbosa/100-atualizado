import React, { useState, useEffect, useMemo } from 'react';

interface PDFPreviewProps {
  type: 'PF_HONORARIOS' | 'PF_PROCURACAO' | 'PF_HIPO' | 'PJ_HONORARIOS' | 'PJ_PROCURACAO' | 'PARTNERSHIP';
  data: any;
  zoom: number;
  manualOverride?: string | null;
}

// Estrutura de Bloco para o Paginador
type BlockType = 'HEADER' | 'TITLE' | 'PARAGRAPH' | 'TABLE' | 'SIGNATURES' | 'SPACER';
interface ContentBlock {
  type: BlockType;
  content?: string;
  html?: string;
  cost: number; // Custo estimado em "unidades de altura" (aprox caracteres + margem)
}

const PDFPreview: React.FC<PDFPreviewProps> = ({ type, data, zoom, manualOverride }) => {
  const [parentWidth, setParentWidth] = useState(595);
  
  useEffect(() => {
    const updateSize = () => {
      const parent = document.querySelector('main');
      if (parent) {
        setParentWidth(parent.clientWidth - 40);
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const A4_WIDTH_PX = 794; // 210mm @ 96dpi
  const baseScale = Math.min(1, parentWidth / A4_WIDTH_PX);
  const finalScale = (zoom / 100) * baseScale;

  // --- Helpers de Formatação ---
  const formatCurrency = (val: string) => (!val || val === '0,00' ? '________________' : `R$ ${val.replace('R$', '').trim()}`);
  const formatDateString = (dateStr: string) => {
    if (!dateStr) return '________________';
    const parts = dateStr.split('-');
    return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : dateStr;
  };
  const isSinglePayment = ['PIX', 'CARTÃO DE CRÉDITO', 'À VISTA'].includes(data.formaPagamento);

  const replace = (text: string) => {
    if (!text) return "";
    let result = text;
    const mappings: Record<string, string> = {
      '/NOME/': data.nome || '________________',
      '/NOME DA EMPRESA/': data.razaoSocial || '________________',
      '/CNPJ/': data.cnpj || '________________',
      '/CNPJ DA EMPRESA/': data.cnpj || '________________',
      '/ENDEREÇO DE EMPRESA/': data.enderecoSede || '________________',
      '/ENDEREÇO DA SEDE/': data.enderecoSede || '________________',
      '/BAIRRO DO REPRESENTANDE/': data.bairroSede || data.complemento || '________________',
      '/CIDADE DA SEDE/': data.cidadeSede || '________________',
      '/ESTADO DA CEP/': data.estadoSede || '________________',
      '/CEP DO DA SEDE/': data.cepSede || '________________',
      '/NOME DO REPRESENTANTE/': data.nomeRepresentante || '________________',
      '/NACIONALIDADE/': data.nacionalidade || data.nacionalidadeRep || '________________',
      '/PROFISSÃO/': data.profissao || data.profissaoRep || '________________',
      '/ESTADO CIVIL/': data.estadoCivil || data.estadoCivilRep || '________________',
      '/CPF/': data.cpf || data.cpfRep || '________________',
      '/Rua/': data.rua || data.enderecoRep || '________________',
      '/ENDEREÇO DO REPRESENTANDE/': data.enderecoRep || '________________',
      '/CIDADE DO REPRESENTANTE/': data.cidadeRep || '________________',
      '/ESTADO DO REPRESENTANTE/': data.estadoRep || '________________',
      '/CEP DO REPRESENTANTE/': data.cepRep || '________________',
      '/COMPLEMENTO/': data.complemento || '________________',
      '/CEP/': data.cep || '________________',
      '/NUMERO DE PROCESSO/': data.numProcesso || '________________',
      '/NUMEO DE PROCESSO/': data.numProcesso || '________________',
      '/VALOR TOTAL/': formatCurrency(data.valorTotal),
      '/ENTRADA/': formatCurrency(data.entrada),
      '/FORMA DE PAGAMENTO ENTRADA/': data.formaPagamentoEntrada || '________________',
      '/DATA DE ENTRADA/': formatDateString(data.dataEntrada),
      '/VEZES DE PARCELAS/': data.vezesParcelas || '________________',
      '/VALOR DA PARCELA/': formatCurrency(data.valorParcela),
      '/DATA DE PAGAMENTO DAS PARCELAS/': data.dataPagamentoParcelas || '________________',
      '/FORMA DE PAGAMENTO/': data.formaPagamento || '________________',
      '/CIDADE/': data.cidade || data.cidadeRep || '________________',
      '/ESTADO/': data.estado || data.estadoRep || '________________',
      '/DIA/': data.data?.split('-')[2] || new Date().getDate().toString().padStart(2, '0'),
      '/MÊS/': data.data?.split('-')[1] || (new Date().getMonth() + 1).toString().padStart(2, '0'),
      '/ANO/': data.data?.split('-')[0] || new Date().getFullYear().toString(),
    };
    Object.entries(mappings).forEach(([placeholder, value]) => {
      const displayValue = `<span class="font-bold text-black border-b border-gray-400 px-0.5">${value}</span>`;
      result = result.replace(new RegExp(placeholder, 'g'), displayValue);
    });
    return result;
  };

  // --- Componentes de UI ---
  const Header = () => (
    <div className="flex flex-col items-center mb-4 w-full">
      <div className="text-3xl font-black text-[#9c7d2c] tracking-tighter leading-none">FB</div>
      <div className="text-[8px] tracking-[0.4em] text-[#9c7d2c] font-bold uppercase mt-1">Advocacia</div>
      <div className="w-full max-w-[200px] h-[1px] bg-gradient-to-r from-transparent via-[#9c7d2c]/50 to-transparent mt-3"></div>
    </div>
  );

  const Footer = () => (
    <div className="mt-auto pt-2 border-t border-gray-200 flex justify-between items-end text-[7px] text-gray-500 font-medium uppercase tracking-wider w-full">
      <div className="space-y-0.5 text-left leading-tight">
        <p>Av. Maria Teresa, 75, sala 328</p>
        <p>Campo Grande - Rio de Janeiro/RJ</p>
        <p className="lowercase">juridico@flafsonadvocacia.com</p>
      </div>
      <div className="text-right leading-tight">
        <p className="font-black text-gray-900 text-[8px]">Flafson Barbosa</p>
        <p className="font-bold text-[#9c7d2c]">ADVOGADO | OAB/RJ: 213.777</p>
      </div>
    </div>
  );

  const PaymentTable = () => (
    <div className="mt-2 border border-gray-300 rounded-lg overflow-hidden mb-2">
      <div className="bg-gray-100 px-3 py-1 border-b border-gray-300">
        <h4 className="text-[9px] font-black uppercase tracking-widest text-black text-center">Demonstrativo Financeiro</h4>
      </div>
      <table className="w-full text-[9px]">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="px-3 py-1 text-left font-bold text-gray-600 uppercase">Descrição</th>
            <th className="px-3 py-1 text-center font-bold text-gray-600 uppercase">Vencimento</th>
            <th className="px-3 py-1 text-right font-bold text-gray-600 uppercase">Valor</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {isSinglePayment ? (
            <tr>
              <td className="px-3 py-1 font-semibold text-gray-800">Pagamento Único</td>
              <td className="px-3 py-1 text-center text-gray-700">
                {formatDateString(data.dataEntrada)} <span className="text-[7px] uppercase text-gray-500 ml-1">({data.formaPagamento})</span>
              </td>
              <td className="px-3 py-1 text-right font-black text-gray-900">{formatCurrency(data.valorTotal)}</td>
            </tr>
          ) : (
            <>
              <tr>
                <td className="px-3 py-1 font-semibold text-gray-800">Entrada</td>
                <td className="px-3 py-1 text-center text-gray-700">
                  {formatDateString(data.dataEntrada)} <span className="text-[7px] uppercase text-gray-500 ml-1">({data.formaPagamentoEntrada})</span>
                </td>
                <td className="px-3 py-1 text-right font-black text-gray-900">{formatCurrency(data.entrada)}</td>
              </tr>
              {parseInt(data.vezesParcelas) > 0 && (
                <tr>
                  <td className="px-3 py-1 font-semibold text-gray-800">{data.vezesParcelas}x Parcelas</td>
                  <td className="px-3 py-1 text-center text-gray-700">
                    Dia {data.dataPagamentoParcelas || '--'} <span className="text-[7px] uppercase text-gray-500 ml-1">({data.formaPagamento})</span>
                  </td>
                  <td className="px-3 py-1 text-right font-black text-gray-900">{formatCurrency(data.valorParcela)}</td>
                </tr>
              )}
            </>
          )}
          <tr className="bg-gray-50/50">
            <td colSpan={2} className="px-3 py-1 text-right font-black uppercase text-[8px] text-gray-500">Total do Contrato</td>
            <td className="px-3 py-1 text-right font-black text-gray-900">{formatCurrency(data.valorTotal)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );

  const Signatures: React.FC<{ outorganteLabel?: string }> = ({ outorganteLabel = 'OUTORGANTE' }) => (
    <div className="mt-8 text-center space-y-6">
        <p className="font-bold text-[10px]" dangerouslySetInnerHTML={{ __html: replace('/ESTADO/, /DIA/ de /MÊS/ de /ANO/.') }} />
        <div className="flex justify-around items-end pt-2">
          <div className="text-center space-y-0.5">
            <div className="w-48 border-t border-black"></div>
            <p className="text-[10px] font-black uppercase max-w-[200px] truncate" dangerouslySetInnerHTML={{ __html: replace(type.includes('PJ') ? '/NOME DA EMPRESA/' : '/NOME/') }}></p>
            <p className="text-[8px] text-gray-900 font-bold uppercase tracking-widest">({outorganteLabel})</p>
          </div>
        </div>
        <div className="flex justify-around items-end pt-2">
          <div className="text-center space-y-0.5">
            <p className="text-[10px] font-black uppercase text-black">FLAFSON BORGES BARBOSA</p>
            <p className="text-[8px] text-black font-bold uppercase">OAB/RJ 213.777</p>
          </div>
        </div>
    </div>
  );

  // --- Geração de Blocos de Conteúdo ---
  const generateBlocks = (): ContentBlock[] => {
    const blocks: ContentBlock[] = [];
    const addP = (html: string, cost = 150) => blocks.push({ type: 'PARAGRAPH', html: replace(html), cost: html.length * 0.5 + 50 });
    const addTitle = (text: string) => blocks.push({ type: 'TITLE', content: text, cost: 120 });
    
    // Header Cost = ~300
    // Footer Cost = ~200
    // Total Page Capacity ~ 3200 (Conservador)

    if (type === 'PF_HONORARIOS' || type === 'PJ_HONORARIOS') {
      const isPJ = type === 'PJ_HONORARIOS';
      blocks.push({ type: 'HEADER', content: isPJ ? 'CONTRATO DE HONORÁRIOS (PJ)' : 'CONTRATO DE HONORÁRIOS ADVOCATÍCIOS', cost: 150 });
      
      if (isPJ) {
        addP('<strong>CONTRATANTE:</strong> /NOME DA EMPRESA/, CNPJ: /CNPJ DA EMPRESA/, sede: /ENDEREÇO DE EMPRESA/, /BAIRRO DO REPRESENTANDE/, /CIDADE DA SEDE/ - /ESTADO DA CEP/.');
        addP('<strong>REPRESENTANTE LEGAL:</strong> /NOME DO REPRESENTANTE/, /NACIONALIDADE/, /PROFISSÃO/, /ESTADO CIVIL/, CPF: /CPF/, endereço: /ENDEREÇO DO REPRESENTANDE/, /CIDADE DO REPRESENTANTE/.');
      } else {
        addP('<strong>OUTORGANTE:</strong> /NOME/, /ESTADO CIVIL/, /PROFISSÃO/, /NACIONALIDADE/, CPF/MF de nº /CPF/, residente e domiciliado em /Rua/, /COMPLEMENTO/, - CEP: /CEP/, pelo presente instrumento particular de procuração nomeia e constitui seu advogado:');
      }

      addP('<strong>OUTORGADO: Flafson Barbosa Borges</strong>, OAB/RJ 213.777, com escritório profissional localizado na Av. Maria Teresa, 75, sala 328, Campo Grande - Rio de Janeiro, CEP: 23.050-160, e-mail: suporte@flafsonadvocacia.com, telefone/WhatsApp: (21) 99452-6345.');

      addTitle('DO OBJETO DO CONTRATO');
      addP('Cláusula 1ª. O presente instrumento tem como OBJETO a prestação de serviços advocatícios na ação judicial de N°: /NUMEO DE PROCESSO/ que lhe é movida a serem realizados nas instâncias ordinárias e em grau de recurso ao qual fica obrigada a parte contratante a verificar os fatos e fundamentos do processo através do site do tribunal de referência ou ir à serventia para verificar o seu processo e o ratificá-lo e não fazendo estará automaticamente ratificado o processo com seus fatos e fundamentos redigidos. Fica obrigada a parte contratante a tomar ciência do processo e seu número através do telefone do escritório ou pessoalmente ao mesmo.');

      addTitle('DAS ATIVIDADES');
      addP('Cláusula 2ª. As atividades inclusas na prestação de serviço objeto deste instrumento são todas aquelas inerentes à profissão, ou seja, todos os atos inerentes ao exercício da advocacia e aqueles constantes no Estatuto da Ordem dos Advogados do Brasil, bem como os especificados no instrumento de mandato. Atividades que fazem parte além as da procuração são a de atendimento ao cliente inicial, redigir a petição inicial, fazer o cálculo, distribuição da peça judicial, atendimento ao cliente por telefone diariamente em todos os dias úteis do ano, atendimento presencial quando solicitado por e-mail suporte@flafsonadvocacia.com ou telefone acima especificado, acompanhamento do processo judicial, petições interlocutórias no processo.', 300);

      addTitle('DOS ATOS PROCESSUAIS');
      addP('Cláusula 3ª. Havendo necessidade de contratação de outros profissionais, no decurso do processo, o CONTRATADO elaborará substabelecimento, indicando os advogados de seu conhecimento.');

      addTitle('DA COBRANÇA');
      addP('Cláusula 4ª. As partes acordam que facultará ao CONTRATADO, o direito de realizar a cobrança dos honorários por todos os meios admitidos em direito.');

      addTitle('DOS HONORÁRIOS');
      if (isSinglePayment) {
        addP('Cláusula 5ª. Fará jus o contrato o valor de /VALOR TOTAL/ de honorários iniciais, pago /ENTRADA/ de entrada, até dia /DATA DE ENTRADA/ + /VEZES DE PARCELAS/ parcelas iguais no valor de /VALOR DA PARCELA/ todo dia /DATA DE PAGAMENTO DAS PARCELAS/.');
      } else {
        addP('Cláusula 5ª. Fará jus o contrato o valor de /VALOR TOTAL/ de honorários iniciais, pago /ENTRADA/ de entrada, até dia /DATA DE ENTRADA/ + /VEZES DE PARCELAS/ parcelas iguais no valor de /VALOR DA PARCELA/ todo dia /DATA DE PAGAMENTO DAS PARCELAS/.');
      }

      blocks.push({ type: 'TABLE', cost: 400 }); // High cost to force page break if needed

      addP('Caso não pague a mensalidade ou prestação incidirá multa de 10% do valor devido e mais juros de 1% e correção pelo IGP-M ao mês (na falta do índice do IGP-M será adotado outro índice oficial que vier a ser adotado em seu lugar ou equivalente).');
      addP('Parágrafo Primeiro. Os honorários de sucumbência, que são pagos pela parte contrária, serão revertidos integralmente ao CONTRATADO.');
      addP('Parágrafo Segundo - Caso a parte rescinda o contrato de honorários o mesmo terá que enviar uma carta ao escritório com o pedido e a parte contratada ficará com os valores já pagos e os devidos do contrato, <u>por se tratar de honorários iniciais.</u>');
      addP('Parágrafo Terceiro. Caso haja morte ou incapacidade civil do CONTRATADO, seus sucessores ou representante legal receberão os honorários.');
      addP('Parágrafo Quarto. O contratado está autorizado a receber pelo contratante e dar quitação ao processo e retirar a sua parte dos honorários (trinta porcento do total) diretamente do valor que for recebido e terá o prazo de 7 dias uteis para efetuar o pagamento do valor devido ao contratante sem incidir juros e correção monetária, a partir da confirmação da indenização recebida.', 300);
      addP('Parágrafo Quinto. Caso tenha que pagar Imposto de Renda ou qualquer outro imposto ou que o mesmo seja automaticamente deduzido no valor que receba de indenizações materiais, morais ou qualquer outra natureza os mesmos serão pagos exclusivamente pela parte contratante.');
      addP('Cláusula 6ª. Havendo acordo entre o CONTRATANTE e a parte contrária, tal fato não prejudicará o recebimento dos honorários contratados e da sucumbência.');
      addP('Cláusula 7ª. O CONTRATANTE concorda que os honorários advocatícios referentes às custas iniciais dos serviços prestados serão pagos de forma antecipada, no caso de formalização de qualquer acordo. O valor total dos honorários será estipulado na clausula 5°, e deverá ser quitado antes da celebração do referido acordo.');

      addTitle('DA RESCISÃO');
      addP('Cláusula 8ª. O presente contrato poderá ser rescindido por qualquer das partes, mediante aviso prévio, por escrito com aviso de recebimento, com 30 (trinta) dias de antecedência, incidindo nesse caso a totalidade dos honorários contratados.');

      addTitle('DOS DADOS');
      addP('Cláusula 9ª. O contratante autoriza desde já a disponibilização dos dados somente e exclusivamente para os colaboradores do escritório contratado e a única exceção será caso fique inadimplente com o escritório contratado fica autorizado a disponibilizar os dados aos serviços de cadastros de inadimplentes como o SPC, SERASA e PROTESTO.');

      addTitle('DO FORO');
      addP('Cláusula 10ª. Para dirimir quaisquer controvérsias oriundas do CONTRATO, as partes elegem o foro do Centro da Cidade (comarca da capital) da comarca do Rio de Janeiro, Rio de Janeiro.');
      addP('Por estarem assim justos e contratados, firmam o presente instrumento, em duas vias de igual teor.');

      blocks.push({ type: 'SIGNATURES', cost: 400 });
    } else if (type === 'PF_PROCURACAO' || type === 'PJ_PROCURACAO') {
       blocks.push({ type: 'HEADER', content: 'PROCURAÇÃO AD JUDICIA', cost: 150 });
       const isPJ = type === 'PJ_PROCURACAO';
       const procuracaoText = isPJ 
          ? '<strong>OUTORGANTE:</strong> /NOME DA EMPRESA/, CNPJ: /CNPJ/, sede: /ENDEREÇO DA SEDE/, /CIDADE DA SEDE/ - /ESTADO DA CEP/, neste ato representada por /NOME/.'
          : '<strong>OUTORGANTE:</strong> /NOME/, /ESTADO CIVIL/, /PROFISSÃO/, /NACIONALIDADE/, CPF: /CPF/, residente em /Rua/, /COMPLEMENTO/, /CIDADE/ - /ESTADO/.';
       addP(procuracaoText);
       addP('<strong>OUTORGADO:</strong> FLAFSON BORGES BARBOSA, OAB/RJ 213.777, com escritório na Av. Maria Teresa, 75, sala 328, Campo Grande - RJ, CEP: 23.050-160.');
       addP('<span class="font-bold text-[#9c7d2c] uppercase underline">OBJETO:</span> Atuação específica no processo N°: /NUMERO DE PROCESSO/.');
       addP('<span class="font-bold text-[#9c7d2c] uppercase underline">PODERES:</span> Pelo presente instrumento, o(a) outorgante confere ao outorgado os poderes da cláusula "ad judicia et extra" para o foro em geral, podendo propor ações, contestar, recorrer, transigir, firmar compromissos, receber e dar quitação, levantar RPVs e Alvarás, bem como substabelecer, com ou sem reserva de poderes.', 250);
       blocks.push({ type: 'SIGNATURES', cost: 400 });
    } else if (type === 'PF_HIPO') {
       blocks.push({ type: 'HEADER', content: 'DECLARAÇÃO DE HIPOSSUFICIÊNCIA', cost: 150 });
       addP('Eu, <strong>/NOME/</strong>, /NACIONALIDADE/, /ESTADO CIVIL/, /PROFISSÃO/, inscrito(a) no CPF sob o nº /CPF/, residente e domiciliado(a) em /Rua/, /COMPLEMENTO/ - CEP: /CEP/, /CIDADE/ - /ESTADO/, <strong>DECLARO</strong>, para os devidos fins e sob as penas da lei, não possuir condições financeiras de arcar com as custas processuais e honorários advocatícios sem prejuízo do meu próprio sustento e de minha família.', 300);
       addP('Por ser expressão da verdade, firmo a presente declaração para requerer os benefícios da Justiça Gratuita, nos termos do art. 98 e seguintes do Código de Processo Civil e art. 5º, LXXIV, da Constituição Federal.');
       blocks.push({ type: 'SIGNATURES', cost: 400 });
    }

    return blocks;
  };

  // --- Motor de Paginação ---
  const pages = useMemo(() => {
    const blocks = generateBlocks();
    const paginated: ContentBlock[][] = [];
    let currentPage: ContentBlock[] = [];
    let currentHeight = 0;
    const MAX_HEIGHT_PER_PAGE = 3200; // Limite heurístico de "densidade"

    blocks.forEach(block => {
      // Se for título e já estiver perto do fim, quebra página para não ficar órfão
      if (block.type === 'TITLE' && currentHeight > 2500) {
        paginated.push(currentPage);
        currentPage = [];
        currentHeight = 0;
      }

      if (currentHeight + block.cost > MAX_HEIGHT_PER_PAGE) {
        paginated.push(currentPage);
        currentPage = [];
        currentHeight = 0;
      }
      currentPage.push(block);
      currentHeight += block.cost;
    });

    if (currentPage.length > 0) paginated.push(currentPage);
    return paginated;
  }, [type, data]);

  // Styles for dense text
  const pStyle = "mb-[5px] text-justify leading-[1.15] text-[11px] text-gray-900 font-normal";
  const hStyle = "font-black uppercase mt-4 mb-2 text-[10px] text-black tracking-wide";

  return (
    <div className="flex flex-col items-center justify-center w-full print:block print:w-full py-8">
      <div 
        className="print-container relative"
        style={{ 
          width: `${A4_WIDTH_PX * finalScale}px`, 
        }}
      >
        {pages.map((pageBlocks, pageIndex) => (
          <div 
            key={pageIndex}
            className="sheet font-contract origin-top-left"
            style={{ 
              transform: `scale(${finalScale})`,
              transformOrigin: 'top left',
            }}
          >
             <Header />
             
             <div className="sheet-content">
                {pageBlocks.map((block, i) => {
                  switch(block.type) {
                    case 'HEADER': 
                      return <h1 key={i} className="text-center font-black text-sm mb-6 uppercase tracking-widest text-black">{block.content}</h1>;
                    case 'TITLE':
                      return <h2 key={i} className={hStyle}>{block.content}</h2>;
                    case 'PARAGRAPH':
                      return <p key={i} className={pStyle} dangerouslySetInnerHTML={{ __html: block.html || '' }} />;
                    case 'TABLE':
                      return <PaymentTable key={i} />;
                    case 'SIGNATURES':
                      return <Signatures key={i} outorganteLabel={type.includes('PROCURACAO') ? 'OUTORGANTE' : (type === 'PF_HIPO' ? 'DECLARANTE' : 'CONTRATANTE')} />;
                    default: return null;
                  }
                })}
             </div>

             <Footer />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PDFPreview;
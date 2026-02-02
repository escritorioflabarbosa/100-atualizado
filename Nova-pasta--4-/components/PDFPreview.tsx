
import React, { useState, useEffect, useMemo } from 'react';
import { MapPin, Phone, Mail, Globe } from 'lucide-react';

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
  cost: number; // Custo estimado em unidades
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
      const displayValue = `<strong>${value}</strong>`;
      result = result.replace(new RegExp(placeholder, 'g'), displayValue);
    });
    return result;
  };

  // --- Visual Components ---

  const FBLogo = () => (
    <div className="flex flex-col items-center justify-center">
       <div className="relative w-16 h-16 flex items-center justify-center">
          <span className="font-contract text-6xl font-bold text-[#b8860b] absolute left-0 z-10" style={{ textShadow: '2px 2px 0px white' }}>F</span>
          <span className="font-contract text-6xl font-bold text-black absolute left-6 top-1 z-0">B</span>
       </div>
       <div className="text-[10px] tracking-[0.3em] font-bold text-[#b8860b] mt-1 uppercase">Advocacia</div>
    </div>
  );

  const Header = () => (
    <div className="absolute top-0 left-0 w-full pt-4 z-20">
      {/* Golden Swoosh Simulation */}
      <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-[#8B6508] via-[#FFD700] to-[#8B6508]"></div>
      <div className="absolute top-3 left-0 w-full h-1 bg-black"></div>
      
      <div className="flex justify-center mt-6 mb-8">
        <FBLogo />
      </div>
    </div>
  );

  const Footer = ({ pageNum, totalPages }: { pageNum: number, totalPages: number }) => (
    <div className="absolute bottom-0 left-0 w-full z-20">
      <div className="flex justify-between items-end px-12 pb-3 mb-1.5">
        <div className="text-[7px] text-gray-600 space-y-0.5 font-medium">
          <div className="flex items-center space-x-1"><MapPin className="w-2.5 h-2.5 text-[#b8860b]" /> <span>Av. Maria Teresa, nº 75, sala 328 – Edifício Business Completo - Campo Grande – Rio de Janeiro/RJ</span></div>
          <div className="flex items-center space-x-3">
             <div className="flex items-center space-x-1"><Phone className="w-2.5 h-2.5 text-[#b8860b]" /> <span>(21) 99173-5421</span></div>
             <div className="flex items-center space-x-1"><Mail className="w-2.5 h-2.5 text-[#b8860b]" /> <span>juridico@flafsonadvocacia.com</span></div>
             <div className="flex items-center space-x-1"><Globe className="w-2.5 h-2.5 text-[#b8860b]" /> <span>www.flafsonadvocacia.com</span></div>
          </div>
        </div>
        <div className="text-right">
          <div className="font-bold text-[9px] text-black">Flafson Barbosa</div>
          <div className="font-bold text-[7px] text-black uppercase">ADVOGADO | OAB/RJ: 213.777</div>
        </div>
      </div>
      {/* Yellow bottom bar */}
      <div className="w-full h-1.5 bg-[#FFD700]"></div>
    </div>
  );

  const Watermark = () => (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
       <div className="font-contract font-bold text-[400px] text-gray-100 opacity-60 leading-none select-none flex items-center justify-center transform -translate-y-10">
          <span className="text-[#e5e7eb]">f</span>
          <span className="text-[#e5e7eb] -ml-20">B</span>
       </div>
    </div>
  );

  const PaymentTable = () => (
    <div className="mt-4 border border-gray-300 rounded overflow-hidden mb-4 bg-white/90 relative z-10 text-[10px]">
      <div className="bg-gray-100 px-3 py-1.5 border-b border-gray-300">
        <h4 className="font-bold uppercase tracking-widest text-black text-center">Demonstrativo Financeiro</h4>
      </div>
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="px-3 py-1.5 text-left font-bold text-gray-700 uppercase">Descrição</th>
            <th className="px-3 py-1.5 text-center font-bold text-gray-700 uppercase">Vencimento</th>
            <th className="px-3 py-1.5 text-right font-bold text-gray-700 uppercase">Valor</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {isSinglePayment ? (
            <tr>
              <td className="px-3 py-1.5 font-medium text-gray-900">Pagamento Único</td>
              <td className="px-3 py-1.5 text-center text-gray-700">
                {formatDateString(data.dataEntrada)}
              </td>
              <td className="px-3 py-1.5 text-right font-bold text-black">{formatCurrency(data.valorTotal)}</td>
            </tr>
          ) : (
            <>
              <tr>
                <td className="px-3 py-1.5 font-medium text-gray-900">Entrada</td>
                <td className="px-3 py-1.5 text-center text-gray-700">
                  {formatDateString(data.dataEntrada)}
                </td>
                <td className="px-3 py-1.5 text-right font-bold text-black">{formatCurrency(data.entrada)}</td>
              </tr>
              {parseInt(data.vezesParcelas) > 0 && (
                <tr>
                  <td className="px-3 py-1.5 font-medium text-gray-900">{data.vezesParcelas}x Parcelas</td>
                  <td className="px-3 py-1.5 text-center text-gray-700">
                    Dia {data.dataPagamentoParcelas || '--'}
                  </td>
                  <td className="px-3 py-1.5 text-right font-bold text-black">{formatCurrency(data.valorParcela)}</td>
                </tr>
              )}
            </>
          )}
          <tr className="bg-gray-50">
            <td colSpan={2} className="px-3 py-1.5 text-right font-bold uppercase text-gray-600">Total</td>
            <td className="px-3 py-1.5 text-right font-black text-black">{formatCurrency(data.valorTotal)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );

  const Signatures: React.FC<{ outorganteLabel?: string }> = ({ outorganteLabel = 'OUTORGANTE' }) => (
    <div className="mt-12 text-center space-y-8 relative z-10">
        <p className="font-medium text-[11px] uppercase" dangerouslySetInnerHTML={{ __html: replace('/ESTADO/, /DIA/ de /MÊS/ de /ANO/.') }} />
        
        <div className="flex flex-col items-center pt-4 space-y-8">
          <div className="text-center space-y-1 w-full max-w-sm">
            <div className="border-b border-black w-full mb-1"></div>
            <p className="text-[11px] font-bold uppercase" dangerouslySetInnerHTML={{ __html: replace(type.includes('PJ') ? '/NOME DA EMPRESA/' : '/NOME/') }}></p>
            <p className="text-[9px] text-gray-600 font-bold uppercase">({outorganteLabel})</p>
          </div>

          <div className="text-center space-y-1 w-full max-w-sm">
             <div className="text-[11px] font-black uppercase text-black">FLAFSON BORGES BARBOSA</div>
             <p className="text-[9px] text-black font-bold uppercase">OAB/RJ 213.777</p>
          </div>
        </div>
    </div>
  );

  // --- Geração de Blocos de Conteúdo ---
  const generateBlocks = (): ContentBlock[] => {
    const blocks: ContentBlock[] = [];
    
    // Header spacer (approx 150px height reserved)
    blocks.push({ type: 'SPACER', cost: 180 }); 

    const addP = (html: string) => {
        // Custo muito reduzido para permitir mais texto. 11px font size ~= 15px height.
        // Assumindo ~100 chars por linha em A4.
        const lines = Math.ceil(html.length / 100) || 1;
        const estimatedCost = lines * 18 + 10; // 18px line height + gap
        blocks.push({ type: 'PARAGRAPH', html: replace(html), cost: estimatedCost });
    };
    const addTitle = (text: string) => blocks.push({ type: 'TITLE', content: text, cost: 50 });
    
    // Page Height Logic
    // A4 Height ~1123px (96dpi). 
    // Header/Footer take ~250px total. 
    // Content area ~850px.
    // Usaremos uma escala de custo onde 1px = 1 unidade.

    if (type === 'PF_HONORARIOS' || type === 'PJ_HONORARIOS') {
      const isPJ = type === 'PJ_HONORARIOS';
      blocks.push({ type: 'HEADER', content: 'CONTRATO DE HONORÁRIOS ADVOCATÍCIOS', cost: 60 });
      
      if (isPJ) {
        addP('<strong>OUTORGANTE:</strong> /NOME DA EMPRESA/, CNPJ: /CNPJ DA EMPRESA/, com sede em /ENDEREÇO DE EMPRESA/, /BAIRRO DO REPRESENTANDE/, /CIDADE DA SEDE/ - /ESTADO DA CEP/, neste ato representada por <strong>/NOME DO REPRESENTANTE/</strong>, /NACIONALIDADE/, /PROFISSÃO/, /ESTADO CIVIL/, CPF: /CPF/, residente em /ENDEREÇO DO REPRESENTANDE/, /CIDADE DO REPRESENTANTE/.');
      } else {
        addP('<strong>OUTORGANTE:</strong> /NOME/, /ESTADO CIVIL/, /PROFISSÃO/, /NACIONALIDADE/, CPF/MF de nº /CPF/, residente e domiciliado em /Rua/, /COMPLEMENTO/, - CEP: /CEP/, pelo presente instrumento particular de procuração nomeia e constitui seu advogado:');
      }

      addP('<strong>OUTORGADO: Flafson Barbosa Borges</strong>, OAB/RJ 213.777, com escritório profissional localizado na Av. Maria Teresa, 75, sala 328, Campo Grande - Rio de Janeiro, CEP: 23.050-160, e-mail: suporte@flafsonadvocacia.com, telefone/WhatsApp: (21) 99452-6345.');

      addTitle('DO OBJETO DO CONTRATO');
      addP('Cláusula 1ª. O presente instrumento tem como OBJETO a prestação de serviços advocatícios na ação judicial de N°: /NUMEO DE PROCESSO/ que lhe é movida a serem realizados nas instâncias ordinárias e em grau de recurso ao qual fica obrigada a parte contratante a verificar os fatos e fundamentos do processo através do site do tribunal de referência ou ir à serventia para verificar o seu processo e o ratificá-lo e não fazendo estará automaticamente ratificado o processo com seus fatos e fundamentos redigidos. Fica obrigada a parte contratante a tomar ciência do processo e seu número através do telefone do escritório ou pessoalmente ao mesmo.');

      addTitle('DAS ATIVIDADES');
      addP('Cláusula 2ª. As atividades inclusas na prestação de serviço objeto deste instrumento são todas aquelas inerentes à profissão, ou seja, todos os atos inerentes ao exercício da advocacia e aqueles constantes no Estatuto da Ordem dos Advogados do Brasil, bem como os especificados no instrumento de mandato. Atividades que fazem parte além as da procuração são a de atendimento ao cliente inicial, redigir a petição inicial, fazer o cálculo, distribuição da peça judicial, atendimento ao cliente por telefone diariamente em todos os dias úteis do ano, atendimento presencial quando solicitado por e-mail suporte@flafsonadvocacia.com ou telefone acima especificado, acompanhamento do processo judicial, petições interlocutórias no processo.');

      addTitle('DOS ATOS PROCESSUAIS');
      addP('Cláusula 3ª. Havendo necessidade de contratação de outros profissionais, no decurso do processo, o CONTRATADO elaborará substabelecimento, indicando os advogados de seu conhecimento.');

      addTitle('DA COBRANÇA');
      addP('Cláusula 4ª. As partes acordam que facultará ao CONTRATADO, o direito de realizar a cobrança dos honorários por todos os meios admitidos em direito.');

      addTitle('DOS HONORÁRIOS');
      addP('Cláusula 5ª. Fará jus o contrato o valor de /VALOR TOTAL/ de honorários iniciais, pago /ENTRADA/ de entrada, até dia /DATA DE ENTRADA/ + /VEZES DE PARCELAS/ parcelas iguais no valor de /VALOR DA PARCELA/ todo dia /DATA DE PAGAMENTO DAS PARCELAS/.');

      blocks.push({ type: 'TABLE', cost: 120 });

      addP('Caso não pague a mensalidade ou prestação incidirá multa de 10% do valor devido e mais juros de 1% e correção pelo IGP-M ao mês (na falta do índice do IGP-M será adotado outro índice oficial que vier a ser adotado em seu lugar ou equivalente).');
      addP('Parágrafo Primeiro. Os honorários de sucumbência, que são pagos pela parte contrária, serão revertidos integralmente ao CONTRATADO.');
      addP('Parágrafo Segundo - Caso a parte rescinda o contrato de honorários o mesmo terá que enviar uma carta ao escritório com o pedido e a parte contratada ficará com os valores já pagos e os devidos do contrato, <u>por se tratar de honorários iniciais.</u>');
      addP('Parágrafo Terceiro. Caso haja morte ou incapacidade civil do CONTRATADO, seus sucessores ou representante legal receberão os honorários.');
      addP('Parágrafo Quarto. O contratado está autorizado a receber pelo contratante e dar quitação ao processo e retirar a sua parte dos honorários (trinta porcento do total) diretamente do valor que for recebido e terá o prazo de 7 dias uteis para efetuar o pagamento do valor devido ao contratante sem incidir juros e correção monetária, a partir da confirmação da indenização recebida.');
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

      blocks.push({ type: 'SIGNATURES', cost: 180 });
    } else if (type === 'PF_PROCURACAO' || type === 'PJ_PROCURACAO') {
       blocks.push({ type: 'HEADER', content: 'PROCURAÇÃO AD JUDICIA', cost: 60 });
       const isPJ = type === 'PJ_PROCURACAO';
       const procuracaoText = isPJ 
          ? '<strong>OUTORGANTE:</strong> /NOME DA EMPRESA/, CNPJ: /CNPJ/, sede: /ENDEREÇO DA SEDE/, /CIDADE DA SEDE/ - /ESTADO DA CEP/, neste ato representada por /NOME/.'
          : '<strong>OUTORGANTE:</strong> /NOME/, /ESTADO CIVIL/, /PROFISSÃO/, /NACIONALIDADE/, CPF: /CPF/, residente em /Rua/, /COMPLEMENTO/, /CIDADE/ - /ESTADO/.';
       addP(procuracaoText);
       addP('<strong>OUTORGADO:</strong> FLAFSON BORGES BARBOSA, OAB/RJ 213.777, com escritório na Av. Maria Teresa, 75, sala 328, Campo Grande - RJ, CEP: 23.050-160.');
       addP('<strong>OBJETO:</strong> Representar o outorgante no processo judicial de revisão de cláusulas contratuais de N°: /NUMERO DE PROCESSO/, promovendo a defesa dos seus direitos e interesses, podendo, para tanto, propor quaisquer ações, medidas incidentais, acompanhar processos administrativos e/ou judiciais em qualquer Juízo, Instância, Tribunal ou Repartição Pública.');
       addP('<strong>PODERES:</strong> Por este instrumento particular de procuração, constituo meus procuradores outorgados, concedendo-lhe os poderes inerentes da cláusula, poderes da cláusulas ad judicia e especiais, representar o outorgante perante a qualquer Tribunal de Justiça do Brasil, STF, STJ, TRT, TRF, podendo propor qualquer tipo de ação, podendo ainda para tanto praticar os atos de acordar, discordar, transigir, negociar, juntar, dar quitação e receber, receber os honorários contratuais separadamente firmados de trinta por cento do valor de qualquer indenização deste processo diretamente no processo incluindo juros e correção monetária, firmar compromissos, concordar e impugnar cálculos, renunciar e desistir, substabelecer com ou sem reservas de poderes, sendo o presente instrumento de mandato oneroso e contratual, dando tudo por bom e valioso, afim de praticar todos os demais atos necessários ao fiel desempenho deste mandato.');
       blocks.push({ type: 'SIGNATURES', cost: 180 });
    } else if (type === 'PF_HIPO') {
       blocks.push({ type: 'HEADER', content: 'DECLARAÇÃO DE HIPOSSUFICIÊNCIA', cost: 60 });
       addP('Eu, <strong>/NOME/</strong>, /NACIONALIDADE/, /ESTADO CIVIL/, /PROFISSÃO/, inscrito(a) no CPF sob o nº /CPF/, residente e domiciliado(a) em /Rua/, /COMPLEMENTO/ - CEP: /CEP/, /CIDADE/ - /ESTADO/,');
       addP('<strong>DECLARO</strong>, para os devidos fins e sob as penas da lei, que não possuo condições financeiras de arcar com as custas processuais e honorários advocatícios sem prejuízo do meu próprio sustento e de minha família, razão pela qual requeiro os benefícios da justiça gratuita, nos termos do artigo 98 do Código de Processo Civil.');
       addP('Por ser expressão da verdade, firmo a presente declaração.');
       blocks.push({ type: 'SIGNATURES', cost: 180 });
    }

    return blocks;
  };

  // --- Motor de Paginação ---
  const pages = useMemo(() => {
    const blocks = generateBlocks();
    const paginated: ContentBlock[][] = [];
    let currentPage: ContentBlock[] = [];
    let currentHeight = 0;
    // Altura útil segura: 1123px (A4) - 250px (Header/Footer) - Margens = ~800px
    const MAX_CONTENT_HEIGHT = 800; 

    blocks.forEach(block => {
      // Se for SPACER (header), sempre inicia página
      if (block.type === 'SPACER') {
        if (currentPage.length > 0) {
            // Se já tem conteúdo, nada a fazer, o spacer conta como altura
        }
      }

      if (currentHeight + block.cost > MAX_CONTENT_HEIGHT) {
        // Se for assinatura e estiver quase cabendo, tente espremer (aumentando limite temporário)
        if (block.type === 'SIGNATURES' && (currentHeight + block.cost < MAX_CONTENT_HEIGHT + 100)) {
             currentPage.push(block);
             currentHeight += block.cost;
             return;
        }
        
        paginated.push(currentPage);
        currentPage = [];
        currentHeight = 0;
        // Nova página precisa de espaço para header se não for a primeira? 
        // No design, header repete? Geralmente sim.
        // Adicionando custo virtual de header em nova página
        // currentPage.push({ type: 'SPACER', cost: 150 });
        // currentHeight += 150;
      }
      currentPage.push(block);
      currentHeight += block.cost;
    });

    if (currentPage.length > 0) paginated.push(currentPage);
    return paginated;
  }, [type, data]);

  // Styles
  const pStyle = "mb-2 text-justify leading-snug text-[11px] text-gray-900 font-normal relative z-10";
  const hStyle = "font-black uppercase mt-4 mb-2 text-[10px] text-black tracking-wide relative z-10";

  return (
    <div className="flex flex-col items-center justify-center w-full print:block print:w-full py-8 print:p-0">
      <div 
        className="print-container relative"
        style={{ 
          width: `${A4_WIDTH_PX * finalScale}px`, 
        }}
      >
        {pages.map((pageBlocks, pageIndex) => (
          <div 
            key={pageIndex}
            className="sheet font-contract origin-top-left bg-white print:transform-none print:w-full"
            style={{ 
              transform: `scale(${finalScale})`,
              transformOrigin: 'top left',
            }}
          >
             <Header />
             <Watermark />
             
             <div className="sheet-content mt-12">
                {pageBlocks.map((block, i) => {
                  switch(block.type) {
                    case 'SPACER':
                      return <div key={i} style={{ height: '110px' }}></div>;
                    case 'HEADER': 
                      return <h1 key={i} className="text-center font-bold text-sm mb-6 uppercase tracking-wider text-black relative z-10">{block.content}</h1>;
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

             <Footer pageNum={pageIndex + 1} totalPages={pages.length} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PDFPreview;

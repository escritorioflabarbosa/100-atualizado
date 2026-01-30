
import React, { useState, useEffect } from 'react';

interface PDFPreviewProps {
  type: 'PF_HONORARIOS' | 'PF_PROCURACAO' | 'PF_HIPO' | 'PJ_HONORARIOS' | 'PJ_PROCURACAO' | 'PARTNERSHIP';
  data: any;
  zoom: number;
  manualOverride?: string | null;
}

const PDFPreview: React.FC<PDFPreviewProps> = ({ type, data, zoom, manualOverride }) => {
  const [parentWidth, setParentWidth] = useState(595);
  
  useEffect(() => {
    const updateSize = () => {
      const parent = document.querySelector('main');
      if (parent) {
        // Ajuste para considerar o padding do container pai
        setParentWidth(parent.clientWidth - 40);
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // 210mm em pixels @ 96 DPI é aproximadamente 794px
  const A4_WIDTH_PX = 794;
  
  // Lógica de Scale para caber na tela do usuário
  const baseScale = Math.min(1, parentWidth / A4_WIDTH_PX);
  const finalScale = (zoom / 100) * baseScale;

  const formatCurrency = (val: string) => {
    if (!val || val === '0,00') return '________________';
    return `R$ ${val.replace('R$', '').trim()}`;
  };

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

  const PaymentTable = () => (
    <div className="mt-2 border border-gray-300 rounded-lg overflow-hidden break-inside-avoid page-break-inside-avoid">
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

  const Header = () => (
    <div className="flex flex-col items-center mb-6 w-full">
      <div className="text-2xl font-black text-[#9c7d2c] tracking-tighter leading-none">FB</div>
      <div className="text-[7px] tracking-[0.3em] text-[#9c7d2c] font-bold uppercase mt-0.5">Advocacia & Consultoria</div>
      <div className="w-16 h-[1px] bg-[#9c7d2c]/30 mt-2"></div>
    </div>
  );

  const Footer = () => (
    <div className="mt-4 pt-2 border-t border-gray-200 flex justify-between items-end text-[7px] text-gray-500 font-medium uppercase tracking-wider w-full">
      <div className="space-y-0.5 text-left leading-tight">
        <p>Av. Maria Teresa, 75, sala 328</p>
        <p>Campo Grande - RJ • (21) 99452-6345</p>
      </div>
      <div className="text-right leading-tight">
        <p className="font-black text-gray-800">Flafson Borges Barbosa</p>
        <p className="font-bold text-[#9c7d2c]">OAB/RJ: 213.777</p>
      </div>
    </div>
  );

  // Styles for dense text: Line height 1.15, justified, bottom margin 5px
  const pStyle = "mb-[5px] text-justify leading-[1.15]";
  const hStyle = "font-black uppercase mt-3 mb-1 text-[10px] text-[#9c7d2c] tracking-wider underline";

  const ContractContent = () => {
    switch (type) {
      case 'PF_HONORARIOS':
        return (
          <div className="text-[11px] text-gray-900 font-normal">
            <h1 className="text-center font-black text-sm mb-4 uppercase underline tracking-widest">CONTRATO DE HONORÁRIOS</h1>
            
            <p className={pStyle} dangerouslySetInnerHTML={{ __html: replace('<strong>CONTRATANTE:</strong> /NOME/, /ESTADO CIVIL/, /PROFISSÃO/, /NACIONALIDADE/, CPF/MF de nº /CPF/, residente e domiciliado em /Rua/, /COMPLEMENTO/, - CEP: /CEP/, /CIDADE/ - /ESTADO/.') }} />
            
            <p className={`${pStyle} p-1.5 bg-gray-50 border-l-2 border-[#9c7d2c] break-inside-avoid`}>
              <strong>CONTRATADO:</strong> <span className="font-bold">FLAFSON BARBOSA BORGES</span>, advogado inscrito na OAB/RJ sob o nº 213.777, com escritório profissional na Av. Maria Teresa, 75, sala 328, Campo Grande - RJ, CEP: 23.050-160.
            </p>

            <h2 className={hStyle}>1. DO OBJETO</h2>
            <p className={pStyle} dangerouslySetInnerHTML={{ __html: replace('1.1. O presente instrumento tem como objeto a prestação de serviços advocatícios na defesa dos interesses do(a) CONTRATANTE na ação judicial de N°: /NUMERO DE PROCESSO/, abrangendo a atuação em primeira instância e interposição de recursos ordinários.') }} />
            
            <p className={pStyle}>1.2. As atividades compreendem o ajuizamento da ação, elaboração de defesa, comparecimento em audiências, interposição de recursos e demais atos inerentes ao exercício da advocacia.</p>

            <h2 className={hStyle}>2. DOS HONORÁRIOS</h2>
            {isSinglePayment ? (
                <p className={pStyle} dangerouslySetInnerHTML={{ __html: replace('2.1. Pelos serviços prestados, o(a) CONTRATANTE pagará ao CONTRATADO a quantia total de /VALOR TOTAL/, a ser paga em parcela única na data de /DATA DE ENTRADA/ via /FORMA DE PAGAMENTO/.') }} />
              ) : (
                <p className={pStyle} dangerouslySetInnerHTML={{ __html: replace('2.1. Pelos serviços prestados, o(a) CONTRATANTE pagará a quantia total de /VALOR TOTAL/, sendo uma entrada de /ENTRADA/ (/DATA DE ENTRADA/) e o saldo restante em /VEZES DE PARCELAS/ parcelas mensais de /VALOR DA PARCELA/ (/FORMA DE PAGAMENTO/).') }} />
              )}
            
            <PaymentTable />

            <div className={`space-y-0.5 text-[10px] border-l border-gray-200 pl-2 mt-1 ${pStyle}`}>
                <p>2.2. Os honorários de sucumbência pertencem exclusivamente ao advogado CONTRATADO (Art. 23 da Lei 8.906/94).</p>
                <p>2.3. O CONTRATANTE autoriza, desde já, o destaque dos honorários contratuais (30%) diretamente de eventuais valores a receber na demanda (RPV ou Alvará).</p>
            </div>

            <h2 className={hStyle}>3. DISPOSIÇÕES GERAIS</h2>
            <p className={pStyle}>3.1. As despesas processuais, custas e emolumentos correm por conta do CONTRATANTE. 3.2. A inadimplência de qualquer parcela por mais de 30 dias autoriza a execução imediata do contrato e inscrição nos órgãos de proteção ao crédito.</p>

            <h2 className={hStyle}>4. DO FORO</h2>
            <p className={pStyle}>4.1. Fica eleito o Foro da Comarca da Capital do Rio de Janeiro para dirimir quaisquer dúvidas oriundas deste contrato.</p>
            
            <div className="mt-8 text-center space-y-6 break-inside-avoid page-break-inside-avoid">
                <p className="font-bold text-[10px]" dangerouslySetInnerHTML={{ __html: replace('/CIDADE/, /DIA/ de /MÊS/ de /ANO/.') }} />
                <div className="flex justify-around items-end pt-2">
                  <div className="text-center space-y-0.5">
                    <div className="w-32 border-t border-black"></div>
                    <p className="text-[8px] font-black uppercase max-w-[140px] truncate" dangerouslySetInnerHTML={{ __html: replace('/NOME/') }}></p>
                    <p className="text-[6px] text-gray-500 font-bold uppercase tracking-widest">(CONTRATANTE)</p>
                  </div>
                  <div className="text-center space-y-0.5">
                    <div className="w-32 border-t border-[#9c7d2c]"></div>
                    <p className="text-[8px] font-black uppercase text-[#9c7d2c]">FLAFSON BORGES BARBOSA</p>
                    <p className="text-[6px] text-[#9c7d2c] font-bold uppercase">OAB/RJ 213.777</p>
                  </div>
                </div>
            </div>
          </div>
        );

      case 'PJ_HONORARIOS':
        return (
          <div className="text-[11px] text-gray-900 font-normal">
            <h1 className="text-center font-black text-sm mb-4 uppercase underline tracking-widest">CONTRATO DE HONORÁRIOS (PJ)</h1>
            <p className={pStyle} dangerouslySetInnerHTML={{ __html: replace('<strong>CONTRATANTE:</strong> /NOME DA EMPRESA/, CNPJ: /CNPJ DA EMPRESA/, sede: /ENDEREÇO DE EMPRESA/, /BAIRRO DO REPRESENTANDE/, /CIDADE DA SEDE/ - /ESTADO DA CEP/.') }} />
            <p className={pStyle} dangerouslySetInnerHTML={{ __html: replace('<strong>REPRESENTANTE LEGAL:</strong> /NOME DO REPRESENTANTE/, /NACIONALIDADE/, /PROFISSÃO/, /ESTADO CIVIL/, CPF: /CPF/, endereço: /ENDEREÇO DO REPRESENTANDE/, /CIDADE DO REPRESENTANTE/.') }} />
            
            <h2 className={hStyle}>1. DO OBJETO</h2>
            <p className={pStyle} dangerouslySetInnerHTML={{ __html: replace('1.1. Prestação de serviços jurídicos na ação N°: /NUMERO DE PROCESSO/. 1.2. Inclui ajuizamento, defesa, recursos e acompanhamento processual até decisão final de mérito.') }} />
            
            <h2 className={hStyle}>2. DOS HONORÁRIOS</h2>
            {isSinglePayment ? (
                <p className={pStyle} dangerouslySetInnerHTML={{ __html: replace('2.1. Valor total de /VALOR TOTAL/ pago em parcela única via /FORMA DE PAGAMENTO/ em /DATA DE ENTRADA/.') }} />
              ) : (
                <p className={pStyle} dangerouslySetInnerHTML={{ __html: replace('2.1. Valor total de /VALOR TOTAL/. Entrada de /ENTRADA/ e saldo em /VEZES DE PARCELAS/x de /VALOR DA PARCELA/.') }} />
              )}
              
            <PaymentTable />

            <div className={`space-y-0.5 text-[10px] border-l border-gray-200 pl-2 mt-1 ${pStyle}`}>
                <p>2.2. Sucumbência em favor do CONTRATADO.</p>
                <p>2.3. Autorizado o destaque de 30% sobre o proveito econômico da ação.</p>
            </div>

            <h2 className={hStyle}>3. DISPOSIÇÕES GERAIS</h2>
            <p className={pStyle}>3.1. A rescisão injustificada implica multa de 20% do valor do contrato. 3.2. Foro eleito: Comarca da Capital/RJ.</p>
            
            <div className="mt-8 text-center space-y-6 break-inside-avoid page-break-inside-avoid">
                <p className="font-bold text-[10px]" dangerouslySetInnerHTML={{ __html: replace('/ESTADO/, /DIA/ de /MÊS/ de /ANO/.') }} />
                <div className="flex justify-around items-end pt-2">
                  <div className="text-center space-y-0.5">
                    <div className="w-32 border-t border-black"></div>
                    <p className="text-[8px] font-black uppercase max-w-[140px] truncate" dangerouslySetInnerHTML={{ __html: replace('/NOME DA EMPRESA/') }}></p>
                    <p className="text-[6px] text-gray-500 font-bold uppercase tracking-widest">(CONTRATANTE)</p>
                  </div>
                  <div className="text-center space-y-0.5">
                    <div className="w-32 border-t border-[#9c7d2c]"></div>
                    <p className="text-[8px] font-black uppercase text-[#9c7d2c]">FLAFSON BORGES BARBOSA</p>
                    <p className="text-[6px] text-[#9c7d2c] font-bold uppercase">OAB/RJ 213.777</p>
                  </div>
                </div>
            </div>
          </div>
        );

      case 'PF_PROCURACAO':
      case 'PJ_PROCURACAO':
        const isPJ = type === 'PJ_PROCURACAO';
        const procuracaoText = isPJ 
          ? '<strong>OUTORGANTE:</strong> /NOME DA EMPRESA/, CNPJ: /CNPJ/, sede: /ENDEREÇO DA SEDE/, /CIDADE DA SEDE/ - /ESTADO DA CEP/, neste ato representada por /NOME/.'
          : '<strong>OUTORGANTE:</strong> /NOME/, /ESTADO CIVIL/, /PROFISSÃO/, /NACIONALIDADE/, CPF: /CPF/, residente em /Rua/, /COMPLEMENTO/, /CIDADE/ - /ESTADO/.';
        
        return (
          <div className="text-[11px] text-gray-900 font-normal">
             <h1 className="text-center font-black text-sm mb-6 underline uppercase tracking-widest">PROCURAÇÃO AD JUDICIA</h1>
             <p className={pStyle} dangerouslySetInnerHTML={{ __html: replace(procuracaoText) }} />
             <p className={`${pStyle} font-bold p-1.5 bg-gray-50 border-l-2 border-[#9c7d2c] break-inside-avoid`}>
               <strong>OUTORGADO:</strong> FLAFSON BORGES BARBOSA, OAB/RJ 213.777, com escritório na Av. Maria Teresa, 75, sala 328, Campo Grande - RJ, CEP: 23.050-160.
             </p>
             <p className={pStyle} dangerouslySetInnerHTML={{ __html: replace('<span class="font-bold text-[#9c7d2c] uppercase underline">OBJETO:</span> Atuação específica no processo N°: /NUMERO DE PROCESSO/.') }} />
             <p className={pStyle}><span className="font-bold text-[#9c7d2c] uppercase underline">PODERES:</span> Pelo presente instrumento, o(a) outorgante confere ao outorgado os poderes da cláusula "ad judicia et extra" para o foro em geral, podendo propor ações, contestar, recorrer, transigir, firmar compromissos, receber e dar quitação, levantar RPVs e Alvarás, bem como substabelecer, com ou sem reserva de poderes.</p>
             <div className="text-center mt-12 space-y-8 break-inside-avoid page-break-inside-avoid">
                <p className="font-bold text-[10px]" dangerouslySetInnerHTML={{ __html: replace('/CIDADE/, /DIA/ de /MÊS/ de /ANO/.') }} />
                <div className="flex flex-col items-center">
                  <div className="w-48 border-t border-black mb-1"></div>
                  <p className="font-black uppercase text-[9px]" dangerouslySetInnerHTML={{ __html: replace('/NOME/') }} />
                  <p className="text-[6px] font-bold text-gray-500 uppercase tracking-widest">(OUTORGANTE)</p>
                </div>
             </div>
          </div>
        );

      case 'PF_HIPO':
        return (
          <div className="text-[12px] text-gray-900 font-normal leading-[1.4]">
             <h1 className="text-center font-black text-sm mb-8 underline uppercase tracking-widest">DECLARAÇÃO DE HIPOSSUFICIÊNCIA</h1>
             <p className="mb-4 text-justify" dangerouslySetInnerHTML={{ __html: replace('Eu, <strong>/NOME/</strong>, /NACIONALIDADE/, /ESTADO CIVIL/, /PROFISSÃO/, inscrito(a) no CPF sob o nº /CPF/, residente e domiciliado(a) em /Rua/, /COMPLEMENTO/ - CEP: /CEP/, /CIDADE/ - /ESTADO/, <strong>DECLARO</strong>, para os devidos fins e sob as penas da lei, não possuir condições financeiras de arcar com as custas processuais e honorários advocatícios sem prejuízo do meu próprio sustento e de minha família.') }} />
             <p className="mb-4 text-justify">Por ser expressão da verdade, firmo a presente declaração para requerer os benefícios da Justiça Gratuita, nos termos do art. 98 e seguintes do Código de Processo Civil e art. 5º, LXXIV, da Constituição Federal.</p>
             <div className="text-center mt-16 space-y-12 break-inside-avoid page-break-inside-avoid">
                <p className="font-bold uppercase text-[10px] tracking-widest" dangerouslySetInnerHTML={{ __html: replace('/ESTADO/, /DIA/ de /MÊS/ de /ANO/.') }} />
                <div className="flex flex-col items-center">
                  <div className="w-56 border-t border-black mb-1.5"></div>
                  <p className="font-black uppercase text-[10px] tracking-widest" dangerouslySetInnerHTML={{ __html: replace('/NOME/') }} />
                  <p className="text-[7px] font-bold text-gray-500 uppercase tracking-widest">(DECLARANTE)</p>
                </div>
             </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full print:block print:w-full print:h-auto py-8">
      <div 
        className="print-container relative shadow-2xl bg-white border border-gray-200"
        style={{ 
          width: `${A4_WIDTH_PX * finalScale}px`, 
          // Mantém proporção A4 na tela para simular a folha
          minHeight: `${(A4_WIDTH_PX * 1.4142) * finalScale}px` 
        }}
      >
        <div 
          className="bg-white font-contract origin-top-left" 
          style={{ 
            width: '210mm',
            minHeight: '297mm', // Altura mínima A4
            padding: '20mm 15mm', // Margens Exatas: 2cm Top/Bottom, 1.5cm Sides
            transform: `scale(${finalScale})`,
            boxSizing: 'border-box'
          }}
        >
          {/* Table Layout for Print Header/Footer Repetition - Essential for long contracts */}
          <table className="w-full h-full border-collapse">
            <thead>
              <tr>
                <td>
                   {/* Espaço reservado para header na quebra de pagina */}
                   <div className="h-[40px] mb-2"> 
                      <Header />
                   </div>
                </td>
              </tr>
            </thead>
            
            <tfoot>
              <tr>
                <td>
                   {/* Espaço reservado para footer na quebra de pagina */}
                   <div className="h-[30px] mt-2"> 
                      <Footer />
                   </div>
                </td>
              </tr>
            </tfoot>

            <tbody>
              <tr>
                <td className="align-top">
                  <div className="py-1">
                     <ContractContent />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PDFPreview;

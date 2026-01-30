
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
      const displayValue = `<span class="font-bold text-black border-b border-gray-300 px-0.5">${value}</span>`;
      result = result.replace(new RegExp(placeholder, 'g'), displayValue);
    });
    return result;
  };

  const PaymentTable = () => (
    <div className="mt-2 border border-gray-300 rounded-lg overflow-hidden break-inside-avoid page-break-inside-avoid">
      <div className="bg-gray-100 px-3 py-1.5 border-b border-gray-300">
        <h4 className="text-[9px] font-black uppercase tracking-widest text-black text-center">Demonstrativo de Pagamento</h4>
      </div>
      <table className="w-full text-[9px]">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="px-3 py-1.5 text-left font-bold text-gray-600 uppercase">Item</th>
            <th className="px-3 py-1.5 text-center font-bold text-gray-600 uppercase">Vencimento / Forma</th>
            <th className="px-3 py-1.5 text-right font-bold text-gray-600 uppercase">Valor</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {isSinglePayment ? (
            <tr>
              <td className="px-3 py-1.5 font-semibold text-gray-800">Pagamento Único</td>
              <td className="px-3 py-1.5 text-center text-gray-700">
                {formatDateString(data.dataEntrada)}<br/>
                <span className="text-[7px] font-bold uppercase">Via {data.formaPagamento}</span>
              </td>
              <td className="px-3 py-1.5 text-right font-black text-gray-900">{formatCurrency(data.valorTotal)}</td>
            </tr>
          ) : (
            <>
              <tr>
                <td className="px-3 py-1.5 font-semibold text-gray-800">Sinal / Entrada</td>
                <td className="px-3 py-1.5 text-center text-gray-700">
                  {formatDateString(data.dataEntrada)}<br/>
                  <span className="text-[7px] font-bold uppercase">Via {data.formaPagamentoEntrada}</span>
                </td>
                <td className="px-3 py-1.5 text-right font-black text-gray-900">{formatCurrency(data.entrada)}</td>
              </tr>
              {parseInt(data.vezesParcelas) > 0 && (
                <tr>
                  <td className="px-3 py-1.5 font-semibold text-gray-800">{data.vezesParcelas} Parcelas Fixas</td>
                  <td className="px-3 py-1.5 text-center text-gray-700">
                    Dia {data.dataPagamentoParcelas || '--'}
                    <span className="text-[7px] font-bold uppercase ml-1">({data.formaPagamento})</span>
                  </td>
                  <td className="px-3 py-1.5 text-right font-black text-gray-900">{formatCurrency(data.valorParcela)}</td>
                </tr>
              )}
            </>
          )}
          <tr className="bg-gray-50">
            <td colSpan={2} className="px-3 py-1.5 text-right font-black uppercase text-[8px] text-gray-600">Total Global</td>
            <td className="px-3 py-1.5 text-right font-black text-gray-900">{formatCurrency(data.valorTotal)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );

  const Header = () => (
    <div className="flex flex-col items-center mb-6 w-full">
      <div className="text-2xl font-black text-[#9c7d2c] tracking-tighter">FB</div>
      <div className="text-[7px] tracking-[0.3em] text-[#9c7d2c] font-bold uppercase mt-0.5">FB Advocacia & Consultoria</div>
      <div className="w-16 h-[1px] bg-[#9c7d2c]/30 mt-2"></div>
    </div>
  );

  const Footer = () => (
    <div className="mt-8 pt-2 border-t border-gray-200 flex justify-between items-end text-[7px] text-gray-500 font-medium uppercase tracking-wider w-full">
      <div className="space-y-0.5 text-left">
        <p>Av. Maria Teresa, 75, sala 328 - Business Completo - Campo Grande - RJ</p>
        <p>suporte@flafsonadvocacia.com • (21) 99452-6345</p>
      </div>
      <div className="text-right">
        <p className="font-black text-gray-800">FLAFSON BORGES BARBOSA</p>
        <p className="font-bold text-[#9c7d2c]">OAB/RJ: 213.777</p>
      </div>
    </div>
  );

  // Styles for dense text
  const pStyle = "mb-[8px] text-justify leading-[1.2]";
  const hStyle = "font-black uppercase mt-3 mb-1 text-[10px] text-[#9c7d2c] tracking-wider underline";

  const ContractContent = () => {
    switch (type) {
      case 'PF_HONORARIOS':
        return (
          <div className="text-[11px] text-gray-900 font-normal">
            <h1 className="text-center font-black text-sm mb-4 uppercase underline tracking-widest">CONTRATO DE HONORÁRIOS ADVOCATÍCIOS</h1>
            
            <p className={pStyle} dangerouslySetInnerHTML={{ __html: replace('OUTORGANTE: /NOME/, /ESTADO CIVIL/, /PROFISSÃO/, /NACIONALIDADE/, CPF/MF de nº /CPF/, residente e domiciliado em /Rua/, /COMPLEMENTO/, - CEP: /CEP/, /CIDADE/ - /ESTADO/, pelo presente instrumento particular de procuração nomeia e constitui seu advogado:') }} />
            
            <p className={`${pStyle} p-2 bg-gray-50 border-l-2 border-[#9c7d2c] break-inside-avoid`}>
              <span className="font-bold">OUTORGADO: Flafson Barbosa Borges</span>, OAB/RJ 213.777, Av. Maria Teresa, 75, sala 328, Campo Grande - RJ, CEP: 23.050-160.
            </p>

            <h2 className={hStyle}>DO OBJETO E ATIVIDADES</h2>
            <p className={pStyle} dangerouslySetInnerHTML={{ __html: replace('Cláusula 1ª. O presente instrumento tem como OBJETO a prestação de serviços advocatícios na ação judicial de N°: /NUMERO DE PROCESSO/, nas instâncias ordinárias e em grau de recurso. Fica obrigada a parte contratante a tomar ciência do processo e seu número através do telefone do escritório ou pessoalmente.') }} />
            
            <p className={pStyle}>Cláusula 2ª. As atividades inclusas compreendem todas aquelas inerentes à profissão, conforme Estatuto da OAB, incluindo petição inicial, cálculos, atendimento diário e acompanhamento integral do processo judicial.</p>

            <h2 className={hStyle}>DOS HONORÁRIOS</h2>
            {isSinglePayment ? (
                <p className={pStyle} dangerouslySetInnerHTML={{ __html: replace('Cláusula 3ª. Fará jus o contrato o valor de /VALOR TOTAL/ de honorários iniciais, pagos em parcela única via /FORMA DE PAGAMENTO/ na data de /DATA DE ENTRADA/.') }} />
              ) : (
                <p className={pStyle} dangerouslySetInnerHTML={{ __html: replace('Cláusula 3ª. Fará jus o contrato o valor de /VALOR TOTAL/ de honorários iniciais, pago /ENTRADA/ de entrada via /FORMA DE PAGAMENTO ENTRADA/, até dia /DATA DE ENTRADA/ + /VEZES DE PARCELAS/ parcelas iguais no valor de /VALOR DA PARCELA/ todo dia /DATA DE PAGAMENTO DAS PARCELAS/ via /FORMA DE PAGAMENTO/.') }} />
              )}
            
            <PaymentTable />

            <div className={`space-y-0.5 text-[10px] border-l border-gray-200 pl-2 mt-2 ${pStyle}`}>
                <p>§1º. Os honorários de sucumbência serão revertidos integralmente ao CONTRATADO.</p>
                <p>§2º. O contratado está autorizado a retirar sua parte dos honorários (30% do êxito) diretamente do valor recebido ou RPV.</p>
            </div>

            <h2 className={hStyle}>DA COBRANÇA E RESCISÃO</h2>
            <p className={pStyle}>Cláusula 4ª. Facultará ao CONTRATADO realizar a cobrança por todos os meios admitidos em direito. A inadimplência autoriza inscrição em SPC/SERASA. Cláusula 5ª. Rescisão mediante aviso prévio por escrito com 30 dias de antecedência.</p>

            <h2 className={hStyle}>DO FORO</h2>
            <p className={pStyle}>Cláusula 6ª. Fica eleito o Foro do Centro da Cidade da comarca do Rio de Janeiro para dirimir quaisquer dúvidas oriundas deste contrato.</p>
            
            <div className="mt-8 text-center space-y-8 break-inside-avoid page-break-inside-avoid">
                <p className="font-bold text-[10px]" dangerouslySetInnerHTML={{ __html: replace('/CIDADE/, /DIA/ de /MÊS/ de /ANO/.') }} />
                <div className="flex justify-around items-end pt-4">
                  <div className="text-center space-y-1">
                    <div className="w-32 border-t border-black"></div>
                    <p className="text-[8px] font-black uppercase max-w-[120px] truncate" dangerouslySetInnerHTML={{ __html: replace('/NOME/') }}></p>
                    <p className="text-[6px] text-gray-400 font-bold uppercase tracking-widest">(OUTORGANTE)</p>
                  </div>
                  <div className="text-center space-y-1">
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
            <h1 className="text-center font-black text-sm mb-4 uppercase underline tracking-widest">CONTRATO DE HONORÁRIOS ADVOCATÍCIOS (PJ)</h1>
            <p className={pStyle} dangerouslySetInnerHTML={{ __html: replace('OUTORGANTE: /NOME DA EMPRESA/, inscrita no CNPJ sob nº /CNPJ DA EMPRESA/, com sede na /ENDEREÇO DE EMPRESA/, /BAIRRO DO REPRESENTANDE/, CEP: /CEP DO DA SEDE/, /CIDADE DA SEDE/ - /ESTADO DA CEP/.') }} />
            <p className={pStyle} dangerouslySetInnerHTML={{ __html: replace('REPRESENTANTES LEGAIS: Sr. /NOME DO REPRESENTANTE/, /NACIONALIDADE/, /PROFISSÃO/, /ESTADO CIVIL/, e CPF nº /CPF/, residente em /ENDEREÇO DO REPRESENTANDE/, CEP: /CEP DO REPRESENTANTE/, /CIDADE DO REPRESENTANTE/ - /ESTADO DO REPRESENTANTE/.') }} />
            
            <h2 className={hStyle}>DO OBJETO E ATIVIDADES</h2>
            <p className={pStyle} dangerouslySetInnerHTML={{ __html: replace('Cláusula 1ª. Prestação de serviços na ação N°: /NUMERO DE PROCESSO/. Cláusula 2ª. Atividades inerentes à profissão conforme Estatuto da OAB.') }} />
            
            <h2 className={hStyle}>DOS HONORÁRIOS</h2>
            {isSinglePayment ? (
                <p className={pStyle} dangerouslySetInnerHTML={{ __html: replace('Cláusula 3ª. Fará jus o contrato o valor de /VALOR TOTAL/ de honorários iniciais, pagos em parcela única via /FORMA DE PAGAMENTO/ na data de /DATA DE ENTRADA/.') }} />
              ) : (
                <p className={pStyle} dangerouslySetInnerHTML={{ __html: replace('Cláusula 3ª. Fará jus o contrato o valor de /VALOR TOTAL/ de honorários iniciais.') }} />
              )}
              
            <PaymentTable />

            <div className={`space-y-0.5 text-[10px] border-l border-gray-200 pl-2 mt-2 ${pStyle}`}>
                <p>§1º. Honorários de sucumbência revertidos ao CONTRATADO.</p>
                <p>§2º. Autorização para retenção de 30% de êxito diretamente do valor recebido.</p>
            </div>

            <h2 className={hStyle}>DA RESCISÃO E FORO</h2>
            <p className={pStyle}>Cláusula 4ª. Rescisão exige aviso prévio de 30 dias. Cláusula 5ª. Foro do Centro da Cidade da comarca do Rio de Janeiro.</p>
            
            <div className="mt-8 text-center space-y-8 break-inside-avoid page-break-inside-avoid">
                <p className="font-bold text-[10px]" dangerouslySetInnerHTML={{ __html: replace('/ESTADO/, /DIA/ de /MÊS/ de /ANO/.') }} />
                <div className="flex justify-around items-end pt-4">
                  <div className="text-center space-y-1">
                    <div className="w-32 border-t border-black"></div>
                    <p className="text-[8px] font-black uppercase max-w-[120px] truncate" dangerouslySetInnerHTML={{ __html: replace('/NOME DA EMPRESA/') }}></p>
                    <p className="text-[6px] text-gray-400 font-bold uppercase tracking-widest">(OUTORGANTE)</p>
                  </div>
                  <div className="text-center space-y-1">
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
          ? 'OUTORGANTE: /NOME DA EMPRESA/, inscrita no CNPJ sob nº /CNPJ/, com sede na /ENDEREÇO DA SEDE/, CEP: /CEP DO DA SEDE/, /CIDADE DA SEDE/ - /ESTADO DA CEP/, representada por: /NOME/, /ESTADO CIVIL/, /PROFISSÃO/, /NACIONALIDADE/, CPF/MF nº /CPF/, residente em /Rua/, /COMPLEMENTO/.'
          : 'OUTORGANTE: /NOME/, /ESTADO CIVIL/, /PROFISSÃO/, /NACIONALIDADE/, CPF/MF de nº /CPF/, residente e domiciliado em /Rua/, /COMPLEMENTO/, - CEP: /CEP/, /CIDADE/ - /ESTADO/.';
        
        return (
          <div className="text-[11px] text-gray-900 font-normal">
             <h1 className="text-center font-black text-sm mb-6 underline uppercase tracking-widest">PROCURAÇÃO AD JUDICIA ET EXTRA</h1>
             <p className={pStyle} dangerouslySetInnerHTML={{ __html: replace(procuracaoText) }} />
             <p className={`${pStyle} font-bold p-2 bg-gray-50 border-l-2 border-[#9c7d2c] break-inside-avoid`}>
               OUTORGADO: Flafson Borges Barbosa, OAB/RJ 213.777, Av. Maria Teresa, 75, sala 328, Campo Grande - RJ, CEP: 23.050-160.
             </p>
             <p className={pStyle} dangerouslySetInnerHTML={{ __html: replace('<span class="font-bold text-[#9c7d2c] uppercase underline">OBJETO:</span> Representar o outorgante no processo N°: /NUMERO DE PROCESSO/.') }} />
             <p className={pStyle}><span className="font-bold text-[#9c7d2c] uppercase underline">PODERES:</span> Concedo os poderes das cláusulas ad judicia e especiais, representar perante qualquer Tribunal do Brasil, propor ações, acordar, transigir, dar quitação, receber honorários contratuais de 30% diretamente no processo, firmar compromissos e substabelecer.</p>
             <div className="text-center mt-12 space-y-8 break-inside-avoid page-break-inside-avoid">
                <p className="font-bold text-[10px]" dangerouslySetInnerHTML={{ __html: replace('/CIDADE/, /DIA/ de /MÊS/ de /ANO/.') }} />
                <div className="flex flex-col items-center">
                  <div className="w-48 border-t border-black mb-1"></div>
                  <p className="font-black uppercase text-[9px]" dangerouslySetInnerHTML={{ __html: replace('/NOME/') }} />
                  <p className="text-[6px] font-bold text-gray-400 uppercase tracking-widest">(OUTORGANTE)</p>
                </div>
             </div>
          </div>
        );

      case 'PF_HIPO':
        return (
          <div className="text-[12px] text-gray-900 font-normal leading-[1.4]">
             <h1 className="text-center font-black text-sm mb-8 underline uppercase tracking-widest">DECLARAÇÃO DE HIPOSSUFICIÊNCIA</h1>
             <p className="mb-4 text-justify" dangerouslySetInnerHTML={{ __html: replace('Eu, /NOME/, /ESTADO CIVIL/, /PROFISSÃO/, /NACIONALIDADE/, CPF/MF de nº /CPF/, residente em /Rua/, /COMPLEMENTO/, - CEP: /CEP/, /CIDADE/ - /ESTADO/, DECLARO que não possuo condições de arcar com as custas processuais sem prejuízo do meu sustento, requerendo a gratuidade de justiça conforme artigo 98 do CPC.') }} />
             <p className="mb-8 text-center font-medium italic text-gray-500">Por ser expressão da verdade, firmo a presente.</p>
             <div className="text-center mt-16 space-y-12 break-inside-avoid page-break-inside-avoid">
                <p className="font-bold uppercase text-[10px] tracking-widest" dangerouslySetInnerHTML={{ __html: replace('/ESTADO/, /DIA/ de /MÊS/ de /ANO/.') }} />
                <div className="flex flex-col items-center">
                  <div className="w-56 border-t border-black mb-1.5"></div>
                  <p className="font-black uppercase text-[10px] tracking-widest" dangerouslySetInnerHTML={{ __html: replace('/NOME/') }} />
                  <p className="text-[7px] font-bold text-gray-400 uppercase tracking-widest">(OUTORGANTE)</p>
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
          minHeight: `${(A4_WIDTH_PX * 1.4142) * finalScale}px` // Proporção A4
        }}
      >
        <div 
          className="bg-white font-contract origin-top-left" 
          style={{ 
            width: '210mm',
            minHeight: '297mm', // Altura mínima A4
            padding: '20mm', // Margens exatas de 2cm
            transform: `scale(${finalScale})`,
            boxSizing: 'border-box'
          }}
        >
          {/* Table Layout for Print Header/Footer Repetition */}
          <table className="w-full h-full border-collapse">
            <thead>
              <tr>
                <td>
                   {/* Espaço reservado para header na quebra de pagina - altura fixa */}
                   <div className="h-[40px] mb-4"> 
                      <Header />
                   </div>
                </td>
              </tr>
            </thead>
            
            <tfoot>
              <tr>
                <td>
                   {/* Espaço reservado para footer na quebra de pagina - altura fixa */}
                   <div className="h-[30px] mt-4"> 
                      <Footer />
                   </div>
                </td>
              </tr>
            </tfoot>

            <tbody>
              <tr>
                <td className="align-top">
                  <div className="py-2">
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

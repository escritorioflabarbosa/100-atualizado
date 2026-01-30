
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
        const gap = window.innerWidth < 768 ? 40 : 120;
        setParentWidth(parent.clientWidth - gap);
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const baseScale = Math.min(1.1, parentWidth / 794); // 794px é aprox 210mm @ 96dpi
  const finalScale = (zoom / 100) * baseScale;
  
  // A4 dimensions in px (approximate for screen)
  const A4_WIDTH_PX = 794; 

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
      const displayValue = `<span class="font-bold text-gray-900 border-b border-gray-300 px-0.5">${value}</span>`;
      result = result.replace(new RegExp(placeholder, 'g'), displayValue);
    });
    return result;
  };

  const PaymentTable = () => (
    <div className="mt-4 border border-gray-200 rounded-xl overflow-hidden shadow-sm break-inside-avoid page-break-inside-avoid">
      <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
        <h4 className="text-[9px] font-black uppercase tracking-widest text-[#9c7d2c] text-center">Demonstrativo de Pagamento</h4>
      </div>
      <table className="w-full text-[9px]">
        <thead>
          <tr className="bg-gray-50/50 border-b border-gray-200">
            <th className="px-4 py-2 text-left font-black text-gray-400 uppercase tracking-tighter">Item de Cobrança</th>
            <th className="px-4 py-2 text-center font-black text-gray-400 uppercase tracking-tighter">Vencimento / Forma</th>
            <th className="px-4 py-2 text-right font-black text-gray-400 uppercase tracking-tighter">Valor</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {isSinglePayment ? (
            <tr>
              <td className="px-4 py-2 font-bold text-gray-700">Pagamento Único</td>
              <td className="px-4 py-2 text-center text-gray-600">
                {formatDateString(data.dataEntrada)}<br/>
                <span className="text-[7px] font-bold uppercase">Via {data.formaPagamento}</span>
              </td>
              <td className="px-4 py-2 text-right font-black text-gray-900">{formatCurrency(data.valorTotal)}</td>
            </tr>
          ) : (
            <>
              <tr>
                <td className="px-4 py-2 font-bold text-gray-700">Sinal / Entrada</td>
                <td className="px-4 py-2 text-center text-gray-600">
                  {formatDateString(data.dataEntrada)}<br/>
                  <span className="text-[7px] font-bold uppercase">Via {data.formaPagamentoEntrada}</span>
                </td>
                <td className="px-4 py-2 text-right font-black text-gray-900">{formatCurrency(data.entrada)}</td>
              </tr>
              {parseInt(data.vezesParcelas) > 0 && (
                <tr>
                  <td className="px-4 py-2 font-bold text-gray-700">{data.vezesParcelas} Parcelas Fixas</td>
                  <td className="px-4 py-2 text-center text-gray-600">
                    Todo dia {data.dataPagamentoParcelas || '--'}<br/>
                    <span className="text-[7px] font-bold uppercase">Via {data.formaPagamento}</span>
                  </td>
                  <td className="px-4 py-2 text-right font-black text-gray-900">{formatCurrency(data.valorParcela)} (cada)</td>
                </tr>
              )}
            </>
          )}
          <tr className="bg-[#9c7d2c]/5">
            <td colSpan={2} className="px-4 py-2 text-right font-black uppercase text-[8px] text-[#9c7d2c]">Valor Global do Contrato</td>
            <td className="px-4 py-2 text-right font-black text-gray-900 border-l border-[#9c7d2c]/10">{formatCurrency(data.valorTotal)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );

  const Header = () => (
    <div className="flex flex-col items-center mb-8 w-full">
      <div className="text-3xl font-extrabold text-[#9c7d2c]">FB</div>
      <div className="text-[7px] tracking-[0.4em] text-[#9c7d2c] font-black uppercase mt-1">FB Advocacia & Consultoria</div>
      <div className="w-24 h-[0.5px] bg-[#9c7d2c]/40 mt-3"></div>
    </div>
  );

  const Footer = () => (
    <div className="mt-8 pt-4 border-t border-gray-100 flex justify-between items-end text-[6.5px] text-gray-400 font-bold uppercase tracking-widest w-full">
      <div className="space-y-0.5 text-left">
        <p>Av. Maria Teresa, 75, sala 328 - Business Completo - Campo Grande - RJ</p>
        <p>suporte@flafsonadvocacia.com • (21) 99452-6345</p>
      </div>
      <div className="text-right">
        <p className="font-black text-gray-800 text-[7.5px]">FLAFSON BORGES BARBOSA</p>
        <p className="font-bold text-[#9c7d2c]">OAB/RJ: 213.777</p>
      </div>
    </div>
  );

  const ContractContent = () => {
    switch (type) {
      case 'PF_HONORARIOS':
        return (
          <div className="text-[10px] leading-[1.6] text-gray-800 text-justify space-y-4">
            <h1 className="text-center font-black text-xs mb-6 uppercase underline tracking-widest">CONTRATO DE HONORÁRIOS ADVOCATÍCIOS</h1>
            
            <p dangerouslySetInnerHTML={{ __html: replace('OUTORGANTE: /NOME/, /ESTADO CIVIL/, /PROFISSÃO/, /NACIONALIDADE/, CPF/MF de nº /CPF/, residente e domiciliado em /Rua/, /COMPLEMENTO/, - CEP: /CEP/, /CIDADE/ - /ESTADO/, pelo presente instrumento particular de procuração nomeia e constitui seu advogado:') }} />
            
            <p className="p-3 bg-gray-50 border-l-4 border-[#9c7d2c] rounded-r-xl break-inside-avoid">
              <span className="font-bold text-black">OUTORGADO: Flafson Barbosa Borges</span>, OAB/RJ 213.777, Av. Maria Teresa, 75, sala 328, Campo Grande - RJ, CEP: 23.050-160. suporte@flafsonadvocacia.com.
            </p>

            <h2 className="font-black uppercase mt-4 text-[10px] text-[#9c7d2c] tracking-wider underline">DO OBJETO E ATIVIDADES</h2>
            <p dangerouslySetInnerHTML={{ __html: replace('Cláusula 1ª. O presente instrumento tem como OBJETO a prestação de serviços advocatícios na ação judicial de N°: /NUMERO DE PROCESSO/, nas instâncias ordinárias e em grau de recurso. Fica obrigada a parte contratante a tomar ciência do processo e seu número através do telefone do escritório ou pessoalmente.') }} />
            
            <p>Cláusula 2ª. As atividades inclusas compreendem todas aquelas inerentes à profissão, conforme Estatuto da OAB, incluindo petição inicial, cálculos, atendimento diário e acompanhamento integral do processo judicial.</p>

            <h2 className="font-black uppercase mt-4 text-[10px] text-[#9c7d2c] tracking-wider underline">DOS HONORÁRIOS</h2>
            {isSinglePayment ? (
                <p dangerouslySetInnerHTML={{ __html: replace('Cláusula 3ª. Fará jus o contrato o valor de /VALOR TOTAL/ de honorários iniciais, pagos em parcela única via /FORMA DE PAGAMENTO/ na data de /DATA DE ENTRADA/.') }} />
              ) : (
                <p dangerouslySetInnerHTML={{ __html: replace('Cláusula 3ª. Fará jus o contrato o valor de /VALOR TOTAL/ de honorários iniciais, pago /ENTRADA/ de entrada via /FORMA DE PAGAMENTO ENTRADA/, até dia /DATA DE ENTRADA/ + /VEZES DE PARCELAS/ parcelas iguais no valor de /VALOR DA PARCELA/ todo dia /DATA DE PAGAMENTO DAS PARCELAS/ via /FORMA DE PAGAMENTO/.') }} />
              )}
            
            <PaymentTable />

            <div className="space-y-1 text-[9px] border-l-2 border-gray-100 pl-3">
                <p>§1º. Os honorários de sucumbência serão revertidos integralmente ao CONTRATADO.</p>
                <p>§2º. O contratado está autorizado a retirar sua parte dos honorários (30% do êxito) diretamente do valor recebido ou RPV.</p>
            </div>

            <h2 className="font-black uppercase mt-4 text-[10px] text-[#9c7d2c] tracking-wider underline">DA COBRANÇA E RESCISÃO</h2>
            <p>Cláusula 4ª. Facultará ao CONTRATADO realizar a cobrança por todos os meios admitidos em direito. A inadimplência autoriza inscrição em SPC/SERASA. Cláusula 5ª. Rescisão mediante aviso prévio por escrito com 30 dias de antecedência.</p>

            <h2 className="font-black uppercase mt-4 text-[10px] text-[#9c7d2c] tracking-wider underline">DO FORO</h2>
            <p>Cláusula 6ª. Fica eleito o Foro do Centro da Cidade da comarca do Rio de Janeiro para dirimir quaisquer dúvidas oriundas deste contrato.</p>
            
            <div className="mt-16 text-center space-y-12 break-inside-avoid page-break-inside-avoid">
                <p className="font-bold text-[10px]" dangerouslySetInnerHTML={{ __html: replace('/CIDADE/, /DIA/ de /MÊS/ de /ANO/.') }} />
                <div className="flex justify-around items-end pt-8">
                  <div className="text-center space-y-1">
                    <div className="w-40 border-t border-black"></div>
                    <p className="text-[8px] font-black uppercase max-w-[160px] truncate" dangerouslySetInnerHTML={{ __html: replace('/NOME/') }}></p>
                    <p className="text-[7px] text-gray-400 font-bold uppercase tracking-widest">(OUTORGANTE)</p>
                  </div>
                  <div className="text-center space-y-1">
                    <div className="w-40 border-t border-[#9c7d2c]"></div>
                    <p className="text-[8px] font-black uppercase text-[#9c7d2c]">FLAFSON BORGES BARBOSA</p>
                    <p className="text-[7px] text-[#9c7d2c] font-bold uppercase">OAB/RJ 213.777</p>
                  </div>
                </div>
            </div>
          </div>
        );

      case 'PJ_HONORARIOS':
        return (
          <div className="text-[10px] leading-[1.6] text-gray-800 text-justify space-y-4">
            <h1 className="text-center font-black text-xs mb-6 uppercase underline tracking-widest">CONTRATO DE HONORÁRIOS ADVOCATÍCIOS (PJ)</h1>
            <p dangerouslySetInnerHTML={{ __html: replace('OUTORGANTE: /NOME DA EMPRESA/, inscrita no CNPJ sob nº /CNPJ DA EMPRESA/, com sede na /ENDEREÇO DE EMPRESA/, /BAIRRO DO REPRESENTANDE/, CEP: /CEP DO DA SEDE/, /CIDADE DA SEDE/ - /ESTADO DA CEP/.') }} />
            <p dangerouslySetInnerHTML={{ __html: replace('REPRESENTANTES LEGAIS: Sr. /NOME DO REPRESENTANTE/, /NACIONALIDADE/, /PROFISSÃO/, /ESTADO CIVIL/, e CPF nº /CPF/, residente em /ENDEREÇO DO REPRESENTANDE/, CEP: /CEP DO REPRESENTANTE/, /CIDADE DO REPRESENTANTE/ - /ESTADO DO REPRESENTANTE/.') }} />
            
            <h2 className="font-black uppercase mt-4 text-[10px] text-[#9c7d2c] tracking-wider underline">DO OBJETO E ATIVIDADES</h2>
            <p dangerouslySetInnerHTML={{ __html: replace('Cláusula 1ª. Prestação de serviços na ação N°: /NUMERO DE PROCESSO/. Cláusula 2ª. Atividades inerentes à profissão conforme Estatuto da OAB.') }} />
            
            <h2 className="font-black uppercase mt-4 text-[10px] text-[#9c7d2c] tracking-wider underline">DOS HONORÁRIOS</h2>
            {isSinglePayment ? (
                <p dangerouslySetInnerHTML={{ __html: replace('Cláusula 3ª. Fará jus o contrato o valor de /VALOR TOTAL/ de honorários iniciais, pagos em parcela única via /FORMA DE PAGAMENTO/ na data de /DATA DE ENTRADA/.') }} />
              ) : (
                <p dangerouslySetInnerHTML={{ __html: replace('Cláusula 3ª. Fará jus o contrato o valor de /VALOR TOTAL/ de honorários iniciais.') }} />
              )}
              
            <PaymentTable />

            <div className="space-y-1 text-[9px] border-l-2 border-gray-100 pl-3">
                <p>§1º. Honorários de sucumbência revertidos ao CONTRATADO.</p>
                <p>§2º. Autorização para retenção de 30% de êxito diretamente do valor recebido.</p>
            </div>

            <h2 className="font-black uppercase mt-4 text-[10px] text-[#9c7d2c] tracking-wider underline">DA RESCISÃO E FORO</h2>
            <p>Cláusula 4ª. Rescisão exige aviso prévio de 30 dias. Cláusula 5ª. Foro do Centro da Cidade da comarca do Rio de Janeiro.</p>
            
            <div className="mt-16 text-center space-y-12 break-inside-avoid page-break-inside-avoid">
                <p className="font-bold text-[10px]" dangerouslySetInnerHTML={{ __html: replace('/ESTADO/, /DIA/ de /MÊS/ de /ANO/.') }} />
                <div className="flex justify-around items-end pt-8">
                  <div className="text-center space-y-1">
                    <div className="w-40 border-t border-black"></div>
                    <p className="text-[8px] font-black uppercase max-w-[160px] truncate" dangerouslySetInnerHTML={{ __html: replace('/NOME DA EMPRESA/') }}></p>
                    <p className="text-[7px] text-gray-400 font-bold uppercase tracking-widest">(OUTORGANTE)</p>
                  </div>
                  <div className="text-center space-y-1">
                    <div className="w-40 border-t border-[#9c7d2c]"></div>
                    <p className="text-[8px] font-black uppercase text-[#9c7d2c]">FLAFSON BORGES BARBOSA</p>
                    <p className="text-[7px] text-[#9c7d2c] font-bold uppercase">OAB/RJ 213.777</p>
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
          <div className="text-[10px] leading-[1.65] text-gray-800 text-justify">
             <h1 className="text-center font-black text-xs mb-8 underline uppercase tracking-widest">PROCURAÇÃO AD JUDICIA ET EXTRA</h1>
             <p className="mb-4" dangerouslySetInnerHTML={{ __html: replace(procuracaoText) }} />
             <p className="mb-4 font-bold p-4 bg-gray-50 border-l-4 border-[#9c7d2c] rounded-r-xl break-inside-avoid">
               OUTORGADO: Flafson Borges Barbosa, OAB/RJ 213.777, Av. Maria Teresa, 75, sala 328, Campo Grande - RJ, CEP: 23.050-160. suporte@flafsonadvocacia.com.
             </p>
             <p className="mb-4" dangerouslySetInnerHTML={{ __html: replace('<span class="font-bold text-[#9c7d2c] uppercase underline">OBJETO:</span> Representar o outorgante no processo N°: /NUMERO DE PROCESSO/.') }} />
             <p className="mb-8"><span className="font-bold text-[#9c7d2c] uppercase underline">PODERES:</span> Concedo os poderes das cláusulas ad judicia e especiais, representar perante qualquer Tribunal do Brasil, propor ações, acordar, transigir, dar quitação, receber honorários contratuais de 30% diretamente no processo, firmar compromissos e substabelecer.</p>
             <div className="text-center mt-12 space-y-12 break-inside-avoid page-break-inside-avoid">
                <p className="font-bold text-[9.5px]" dangerouslySetInnerHTML={{ __html: replace('/CIDADE/, /DIA/ de /MÊS/ de /ANO/.') }} />
                <div className="flex flex-col items-center">
                  <div className="w-56 border-t border-black mb-1"></div>
                  <p className="font-black uppercase text-[9px]" dangerouslySetInnerHTML={{ __html: replace('/NOME/') }} />
                  <p className="text-[6.5px] font-bold text-gray-400 uppercase tracking-widest">(OUTORGANTE)</p>
                </div>
             </div>
          </div>
        );

      case 'PF_HIPO':
        return (
          <div className="text-[11px] leading-[1.8] text-gray-800 text-justify">
             <h1 className="text-center font-black text-xs mb-10 underline uppercase tracking-widest">DECLARAÇÃO DE HIPOSSUFICIÊNCIA</h1>
             <p className="mb-7" dangerouslySetInnerHTML={{ __html: replace('Eu, /NOME/, /ESTADO CIVIL/, /PROFISSÃO/, /NACIONALIDADE/, CPF/MF de nº /CPF/, residente em /Rua/, /COMPLEMENTO/, - CEP: /CEP/, /CIDADE/ - /ESTADO/, DECLARO que não possuo condições de arcar com as custas processuais sem prejuízo do meu sustento, requerendo a gratuidade de justiça conforme artigo 98 do CPC.') }} />
             <p className="mb-10 text-center font-medium italic text-gray-500">Por ser expressão da verdade, firmo a presente.</p>
             <div className="text-center mt-24 space-y-16 break-inside-avoid page-break-inside-avoid">
                <p className="font-bold uppercase text-[9.5px] tracking-widest" dangerouslySetInnerHTML={{ __html: replace('/ESTADO/, /DIA/ de /MÊS/ de /ANO/.') }} />
                <div className="flex flex-col items-center">
                  <div className="w-64 border-t border-black mb-1.5"></div>
                  <p className="font-black uppercase text-[10px] tracking-widest" dangerouslySetInnerHTML={{ __html: replace('/NOME/') }} />
                  <p className="text-[7.5px] font-bold text-gray-400 uppercase tracking-widest">(OUTORGANTE)</p>
                </div>
             </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full print:block print:w-full print:h-auto">
      <div 
        className="print-scale-fix relative shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] bg-white print:shadow-none print:m-0 border border-gray-100 print:border-none print:w-full" 
        style={{ width: `${A4_WIDTH_PX * finalScale}px`, minHeight: 'auto' }}
      >
        <div 
          className="bg-white p-12 print:p-0 flex flex-col font-contract print:static print:transform-none print:w-full" 
          style={{ 
            width: `${A4_WIDTH_PX}px`,
            minHeight: '1123px', // 297mm @ 96dpi aprox
            transform: `scale(${finalScale})`, 
            transformOrigin: 'top left',
          }}
        >
          {/* Table Layout for Print Header/Footer Repetition */}
          <table className="w-full h-full">
            <thead>
              <tr>
                <td>
                   <div className="h-24"> {/* Espaço reservado para header na quebra de pagina */}
                      <Header />
                   </div>
                </td>
              </tr>
            </thead>
            
            <tfoot>
              <tr>
                <td>
                   <div className="h-16"> {/* Espaço reservado para footer na quebra de pagina */}
                      <Footer />
                   </div>
                </td>
              </tr>
            </tfoot>

            <tbody>
              <tr>
                <td>
                  <div className="py-4">
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

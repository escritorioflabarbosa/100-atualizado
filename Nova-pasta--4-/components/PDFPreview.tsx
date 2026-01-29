
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
        const gap = window.innerWidth < 768 ? 24 : 96;
        setParentWidth(parent.clientWidth - gap);
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const baseScale = parentWidth / 595;
  const finalScale = (zoom / 100) * baseScale;
  
  const scaledWidth = 595 * finalScale;
  const scaledHeight = 842 * finalScale;

  const replace = (text: string) => {
    if (!text) return "";
    let result = text;

    const formatCurrency = (val: string) => {
      if (!val || val === '0,00') return '________________';
      return `R$ ${val.replace('R$', '').trim()}`;
    };

    const formatDateString = (dateStr: string) => {
      if (!dateStr) return '________________';
      const parts = dateStr.split('-');
      return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : dateStr;
    };

    const mappings: Record<string, string> = {
      '/NOME/': data.nome || data.nomeRepresentante || '________________',
      '/NOME DA EMPRESA/': data.razaoSocial || '________________',
      '/CNPJ/': data.cnpj || '________________',
      '/ENDEREÇO DA SEDE/': data.enderecoSede || '________________',
      '/CIDADE DA SEDE/': data.cidadeSede || '________________',
      '/ESTADO DA SEDE/': data.estadoSede || '________________',
      '/CEP DA SEDE/': data.cepSede || '________________',
      '/ESTADO CIVIL/': data.estadoCivil || data.estadoCivilRep || '________________',
      '/PROFISSÃO/': data.profissao || data.profissaoRep || '________________',
      '/NACIONALIDADE/': data.nacionalidade || data.nacionalidadeRep || '________________',
      '/CPF/': data.cpf || data.cpfRep || '________________',
      '/Rua/': data.rua || data.enderecoRep || '________________',
      '/COMPLEMENTO/': data.complemento || '________________',
      '/CEP/': data.cep || data.cepRep || '________________',
      '/NUMERO DE PROCESSO/': data.numProcesso || '________________',
      '/VALOR TOTAL/': formatCurrency(data.valorTotal),
      '/ENTRADA/': formatCurrency(data.entrada),
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

  const PageWrapper = ({ children }: { children?: React.ReactNode }) => (
    <div className="flex flex-col items-center justify-center w-full" style={{ minHeight: `${scaledHeight}px` }}>
      <div className="relative shadow-2xl bg-white overflow-hidden print:shadow-none print:m-0" style={{ width: `${scaledWidth}px`, height: `${scaledHeight}px` }}>
        <div className="bg-white p-12 flex flex-col font-contract print:p-12" 
          style={{ width: '595px', height: '842px', transform: `scale(${finalScale})`, transformOrigin: 'top left', position: 'absolute', top: 0, left: 0 }}>
          <div className="flex flex-col items-center mb-8">
            <div className="text-4xl font-extrabold text-[#9c7d2c]">FB</div>
            <div className="text-[8px] tracking-[0.4em] text-[#9c7d2c] font-black uppercase mt-2">FB Advocacia & Consultoria</div>
            <div className="w-32 h-[1px] bg-[#9c7d2c]/30 mt-4"></div>
          </div>
          <div className="flex-grow overflow-hidden">{children}</div>
          <div className="mt-auto pt-6 border-t border-gray-100 flex justify-between items-end text-[7px] text-gray-400 font-bold uppercase">
             <div className="space-y-1">
                <p>Av. Maria Teresa, 75, sala 328 - Business Completo - Campo Grande - RJ</p>
                <p>juridico@flafsonadvocacia.com • (21) 99173-5421</p>
             </div>
             <div className="text-right">
                <p className="font-black text-gray-800 text-[8px]">FLAFSON BORGES BARBOSA</p>
                <p className="font-bold text-[#9c7d2c]">OAB/RJ: 213.777</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContract = () => {
    switch (type) {
      case 'PF_HONORARIOS':
      case 'PJ_HONORARIOS':
        return (
          <>
            <PageWrapper>
              <div className="text-[10px] leading-[1.6] text-gray-800 text-justify">
                <h1 className="text-center font-black text-sm mb-10 uppercase underline">CONTRATO DE HONORÁRIOS ADVOCATÍCIOS</h1>
                <p className="mb-6" dangerouslySetInnerHTML={{ __html: replace(type === 'PJ_HONORARIOS' ? 'OUTORGANTE: /NOME DA EMPRESA/, inscrita no CNPJ sob nº /CNPJ/, com sede na /ENDEREÇO DA SEDE/, representada por /NOME/, /PROFISSÃO/, CPF nº /CPF/.' : 'OUTORGANTE: /NOME/, /ESTADO CIVIL/, /PROFISSÃO/, /NACIONALIDADE/, CPF nº /CPF/, residente em /Rua/, /COMPLEMENTO/, CEP: /CEP/.') }} />
                <p className="mb-8 p-6 bg-gray-50 border-l-4 border-[#9c7d2c] rounded-r-3xl"><span className="font-bold text-black">OUTORGADO: Flafson Barbosa Borges</span>, OAB/RJ 213.777, com endereço na Av. Maria Teresa, 75, sala 328, Campo Grande, Rio de Janeiro - RJ.</p>
                <h2 className="font-black uppercase mb-3 text-[11px] text-[#9c7d2c]">DO OBJETO</h2>
                <p dangerouslySetInnerHTML={{ __html: replace('Cláusula 1ª. O objeto deste é a prestação de serviços advocatícios na ação de N°: /NUMERO DE PROCESSO/.') }} />
              </div>
            </PageWrapper>
            <PageWrapper>
              <div className="text-[10px] leading-[1.6] text-gray-800 text-justify">
                <h2 className="font-black uppercase mb-3 text-[11px] text-[#9c7d2c]">DOS HONORÁRIOS</h2>
                <p dangerouslySetInnerHTML={{ __html: replace('Cláusula 5ª. Valor total de /VALOR TOTAL/, com sinal de /ENTRADA/ pago em /DATA DE ENTRADA/ e saldo em /VEZES DE PARCELAS/ parcelas de /VALOR DA PARCELA/ todo dia /DATA DE PAGAMENTO DAS PARCELAS/.') }} />
                <div className="mt-40 pt-12 border-t flex justify-around items-end">
                   <div className="text-center space-y-2"><div className="w-56 border-t border-black"></div><p className="text-[8px] font-black uppercase">Contratante</p></div>
                   <div className="text-center space-y-2"><div className="w-56 border-t border-black"></div><p className="text-[8px] font-black uppercase text-[#9c7d2c]">Flafson Barbosa Borges</p></div>
                </div>
              </div>
            </PageWrapper>
          </>
        );
      case 'PF_PROCURACAO':
      case 'PJ_PROCURACAO':
        const outorganteText = type === 'PJ_PROCURACAO' 
          ? 'OUTORGANTE: /NOME DA EMPRESA/, pessoa jurídica de direito privado, inscrita no CNPJ sob nº /CNPJ/, com sede na /ENDEREÇO DA SEDE/, /CIDADE DA SEDE/ - /ESTADO DA SEDE/ - CEP: /CEP DA SEDE/, neste ato representada por seu:'
          : 'OUTORGANTE: /NOME/, /ESTADO CIVIL/, /PROFISSÃO/, /NACIONALIDADE/, CPF/MF de nº /CPF/, residente e domiciliado em /Rua/, /COMPLEMENTO/, - CEP: /CEP/, pelo presente instrumento particular de procuração nomeia e constitui seu advogado:';
        
        return (
          <PageWrapper>
            <div className="text-[9.5px] leading-[1.6] text-gray-800 text-justify">
               <h1 className="text-center font-black text-sm mb-8 underline uppercase tracking-widest">PROCURAÇÃO</h1>
               <p className="mb-4" dangerouslySetInnerHTML={{ __html: replace(outorganteText) }} />
               {type === 'PJ_PROCURACAO' && <p className="mb-4" dangerouslySetInnerHTML={{ __html: replace('/NOME/, /ESTADO CIVIL/, /PROFISSÃO/, /NACIONALIDADE/, CPF/MF de nº /CPF/, residente e domiciliado em /Rua/, /COMPLEMENTO/, - CEP: /CEP/...') }} />}
               <p className="mb-4 font-bold p-4 bg-gray-50 border-l-4 border-[#9c7d2c] rounded-r-2xl shadow-sm">
                 OUTORGADO: Flafson Borges Barbosa, OAB/RJ 213.777, com escritório profissional localizado na Av. Maria Teresa, 75, sala 328, Campo Grande - Rio de Janeiro, CEP: 23.050-160, e-mail: juridico@flafsonadvocacia.com, telefone/WhatsApp: (21) 99173-5421.
               </p>
               <p className="mb-4" dangerouslySetInnerHTML={{ __html: replace('OBJETO: Representar o outorgante no processo judicial de revisão de cláusulas contratuais de N°:/NUMERO DE PROCESSO/, promovendo a defesa dos seus direitos e interesses...') }} />
               <p className="mb-8"><span className="font-bold text-[#9c7d2c]">PODERES:</span> Por este instrumento particular de procuração, constituo meus procuradores outorgados, concedendo-lhe os poderes inerentes da cláusula, poderes da cláusulas ad judicia e especiais, representar o outorgante perante a qualquer Tribunal de Justiça do Brasil, STF, STJ, TRT, TRF, podendo propor qualquer tipo de ação, podendo ainda para tanto praticar os atos de acordar, discordar, transigir, negociar, juntar, dar quitação e receber, receber os honorários contratuais separadamente firmados de trinta por cento do valor de qualquer indenização deste processo diretamente no processo incluindo juros e correção monetária, firmar compromissos, concordar e impugnar cálculos, renunciar e desistir, substabelecer com ou sem reservas de poderes, sendo o presente instrumento de mandato oneroso e contratual, dando tudo por bom e valioso, afim de praticar todos os demais atos necessários ao fiel desempenho deste mandato.</p>
               <div className="text-center mt-20 space-y-16">
                  <p className="font-bold text-[10px]" dangerouslySetInnerHTML={{ __html: replace('/CIDADE/, /DIA/ de /MÊS/ de /ANO/.') }} />
                  <div className="flex flex-col items-center">
                    <div className="w-64 border-t border-black mb-1"></div>
                    <p className="font-black uppercase text-[10px]" dangerouslySetInnerHTML={{ __html: replace('/NOME/') }} />
                    <p className="text-[7px] font-bold text-gray-400 uppercase tracking-widest">(Outorgante)</p>
                    <p className="font-black text-[9px] mt-4">FLAFSON BORGES BARBOSA</p>
                    <p className="text-[7px] text-[#9c7d2c]">OAB/RJ 213.777</p>
                  </div>
               </div>
            </div>
          </PageWrapper>
        );
      case 'PF_HIPO':
        return (
          <PageWrapper>
            <div className="text-[11px] leading-[1.8] text-gray-800 text-justify">
               <h1 className="text-center font-black text-sm mb-12 underline uppercase tracking-widest">DECLARAÇÃO DE HIPOSSUFICIÊNCIA</h1>
               <p className="mb-8" dangerouslySetInnerHTML={{ __html: replace('Eu, /NOME/, /ESTADO CIVIL/, /PROFISSÃO/, /NACIONALIDADE/, CPF/MF de nº /CPF/, residente e domiciliado em /Rua/, /COMPLEMENTO/, - CEP: /CEP/, DECLARO, para os devidos fins, sob as penas da lei, que não possuo condições financeiras de arcar com as custas processuais e honorários advocatícios sem prejuízo do meu sustento e de minha família, razão pela qual requeiro os benefícios da justiça gratuita, nos termos do artigo 98 do Código de Processo Civil.') }} />
               <p className="mb-12 text-center font-medium italic">Por ser expressão da verdade, firmo a presente.</p>
               <div className="text-center mt-32 space-y-24">
                  <p className="font-bold uppercase text-[10px] tracking-widest" dangerouslySetInnerHTML={{ __html: replace('/ESTADO/, /DIA/ de /MÊS/ de /ANO/.') }} />
                  <div className="flex flex-col items-center">
                    <div className="w-72 border-t-2 border-black mb-2"></div>
                    <p className="font-black uppercase text-[11px] tracking-widest" dangerouslySetInnerHTML={{ __html: replace('/NOME/') }} />
                    <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">(Outorgante)</p>
                  </div>
               </div>
            </div>
          </PageWrapper>
        );
      default: return null;
    }
  };

  return <div className="flex flex-col items-center w-full space-y-12 pb-20">{renderContract()}</div>;
};

export default PDFPreview;


import React, { useState, useEffect } from 'react';

interface PDFPreviewProps {
  type: 'PF_HONORARIOS' | 'PF_PROCURACAO' | 'PF_HIPO' | 'PJ_HONORARIOS' | 'PJ_PROCURACAO' | 'PARTNERSHIP';
  data: any;
  zoom: number;
  manualOverride?: string | null;
}

const PDFPreview: React.FC<PDFPreviewProps> = ({ type, data, zoom, manualOverride }) => {
  const [containerWidth, setContainerWidth] = useState(595);
  
  // Detect mobile width to auto-scale PDF
  useEffect(() => {
    const updateSize = () => {
      const parent = document.querySelector('main');
      if (parent) {
        // Adjust for padding and margins
        const available = parent.clientWidth - (window.innerWidth < 768 ? 32 : 96);
        setContainerWidth(Math.min(595, available));
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const baseScale = containerWidth / 595;
  const finalScale = (zoom / 100) * baseScale;

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
      '/NOME/': data.nome || data.razaoSocial || data.gestor || '________________',
      '/ESTADO CIVIL/': data.estadoCivil || '________________',
      '/PROFISSÃO/': data.profissao || '________________',
      '/NACIONALIDADE/': data.nacionalidade || '________________',
      '/CPF/': data.cpf || '________________',
      '/Rua/': data.rua || '________________',
      '/CEP/': data.cep || '________________',
      '/NUMERO DE PROCESSO/': data.numProcesso || '________________',
      '/VALOR TOTAL/': formatCurrency(data.valorTotal),
      '/ENTRADA/': formatCurrency(data.entrada),
      '/DATA DE ENTRADA/': formatDateString(data.dataEntrada),
      '/VEZES DE PARCELAS/': data.vezesParcelas || '________________',
      '/VALOR DA PARCELA/': formatCurrency(data.valorParcela),
      '/DATA DE PAGAMENTO DAS PARCELAS/': data.dataPagamentoParcelas || '________________',
      '/FORMA DE PAGAMENTO/': data.formaPagamento || '________________',
      '/CIDADE/': data.cidade || '________________',
      '/ESTADO/': data.estado || '________________',
      '/DIA/': data.data?.split('-')[2] || new Date().getDate().toString().padStart(2, '0'),
      '/MÊS/': data.data?.split('-')[1] || (new Date().getMonth() + 1).toString().padStart(2, '0'),
      '/ANO/': data.data?.split('-')[0] || new Date().getFullYear().toString(),
    };

    Object.entries(mappings).forEach(([placeholder, value]) => {
      const displayValue = value.includes('span') ? value : `<span class="font-bold text-gray-900">${value}</span>`;
      result = result.replace(new RegExp(placeholder, 'g'), displayValue);
    });
    return result;
  };

  const Header = () => (
    <div className="flex flex-col items-center mb-6">
      <div className="text-4xl font-extrabold text-[#9c7d2c]">FB</div>
      <div className="text-[8px] tracking-[0.3em] text-[#9c7d2c] font-black uppercase mt-1">FB Advocacia & Consultoria</div>
      <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#9c7d2c]/40 to-transparent mt-2"></div>
    </div>
  );

  const Footer = () => (
    <div className="mt-auto pt-6 border-t border-[#9c7d2c]/20 flex justify-between items-end text-[8px] text-gray-400 font-medium">
      <div className="space-y-1">
        <p>Av. Maria Teresa, nº 75, sala 328 - Business Completo - Campo Grande - RJ</p>
        <div className="flex space-x-3"><span>(21) 99173-5421</span><span>suporte@flafsonadvocacia.com</span></div>
      </div>
      <div className="text-right">
        <p className="font-black text-gray-800 text-[10px]">FLAFSON BORGES BARBOSA</p>
        <p className="uppercase font-bold text-[7px] text-[#9c7d2c]">OAB/RJ: 213.777</p>
      </div>
    </div>
  );

  const PageWrapper = ({ children, pageNumber }: { children?: React.ReactNode, pageNumber?: number }) => (
    <div 
      className="bg-white pdf-shadow p-12 mx-auto mb-8 origin-top transition-all duration-300 flex flex-col pdf-content-container font-contract print:shadow-none print:m-0 print:p-12 print:transform-none border border-gray-100 print:border-none relative shadow-2xl" 
      style={{ 
        width: '595px', 
        height: '842px', 
        transform: `scale(${finalScale})`, 
        marginBottom: `${(finalScale - 1) * 842 + (window.innerWidth < 768 ? 10 : 20)}px` 
      }}
    >
      <Header />
      <div className="flex-grow overflow-hidden">{children}</div>
      <Footer />
    </div>
  );

  const renderContractPages = () => {
    switch (type) {
      case 'PF_HONORARIOS':
        return (
          <>
            <PageWrapper pageNumber={1}>
              <div className="text-[10px] leading-[1.5] text-gray-800 text-justify">
                <h1 className="text-center font-black text-sm mb-6 uppercase underline tracking-tighter">CONTRATO DE HONORÁRIOS ADVOCATÍCIOS</h1>
                <p className="mb-4" dangerouslySetInnerHTML={{ __html: replace('OUTORGANTE: /NOME/, /ESTADO CIVIL/, /PROFISSÃO/, /NACIONALIDADE/, CPF nº /CPF/, residente em /Rua/, CEP: /CEP/.') }} />
                <p className="mb-4 p-4 bg-gray-50 border-l-4 border-[#9c7d2c] rounded-r-lg">
                  <span className="font-bold underline">OUTORGADO: Flafson Barbosa Borges</span>, OAB/RJ 213.777, e-mail: suporte@flafsonadvocacia.com.
                </p>
                <h2 className="font-black uppercase mb-2 text-[11px] text-[#9c7d2c]">DO OBJETO</h2>
                <p className="mb-3" dangerouslySetInnerHTML={{ __html: replace('Cláusula 1ª. Prestação de serviços na ação de N°: /NUMERO DE PROCESSO/.') }} />
              </div>
            </PageWrapper>
            <PageWrapper pageNumber={2}>
              <div className="text-[10px] leading-[1.5] text-gray-800 text-justify">
                <h2 className="font-black uppercase mb-2 text-[11px] text-[#9c7d2c]">DOS HONORÁRIOS</h2>
                <p dangerouslySetInnerHTML={{ __html: replace('Cláusula 5ª. Valor de /VALOR TOTAL/, sendo /ENTRADA/ de entrada e /VEZES DE PARCELAS/ parcelas de /VALOR DA PARCELA/.') }} />
                <div className="mt-10 pt-8 border-t border-gray-100 flex justify-around items-end">
                   <div className="text-center"><div className="w-40 border-t border-black mb-1"></div><p className="text-[8px] font-black uppercase">Outorgante</p></div>
                   <div className="text-center"><div className="w-40 border-t border-black mb-1"></div><p className="text-[8px] font-black uppercase text-[#9c7d2c]">Flafson Barbosa Borges</p></div>
                </div>
              </div>
            </PageWrapper>
          </>
        );
      case 'PF_PROCURACAO':
        return (
          <PageWrapper>
            <div className="text-[11px] leading-relaxed text-gray-800 text-justify">
               <h1 className="text-center font-black text-base mb-10 underline uppercase">PROCURAÇÃO AD JUDICIA</h1>
               <p dangerouslySetInnerHTML={{ __html: replace('OUTORGANTE: /NOME/, portador do CPF nº /CPF/, residente em /Rua/.') }} />
               <p className="my-6 font-bold">OUTORGADO: Flafson Borges Barbosa, OAB/RJ 213.777.</p>
               <h2 className="font-black uppercase mb-2 text-xs text-[#9c7d2c]">PODERES:</h2>
               <p>Poderes amplos da cláusula "ad judicia et extra" para o foro em geral.</p>
            </div>
          </PageWrapper>
        );
      case 'PF_HIPO':
        return (
          <PageWrapper>
            <div className="text-[12px] leading-relaxed text-gray-800 text-justify">
               <h1 className="text-center font-black text-base mb-10 underline uppercase">DECLARAÇÃO DE HIPOSSUFICIÊNCIA</h1>
               <p dangerouslySetInnerHTML={{ __html: replace('Eu, /NOME/, portador do CPF nº /CPF/, declaro não possuir condições de arcar com as custas do processo /NUMERO DE PROCESSO/.') }} />
            </div>
          </PageWrapper>
        );
      default: return null;
    }
  };

  return <div className="flex flex-col items-center w-full">{renderContractPages()}</div>;
};

export default PDFPreview;

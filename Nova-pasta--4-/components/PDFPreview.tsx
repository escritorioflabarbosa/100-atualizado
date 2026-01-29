
import React from 'react';

interface PDFPreviewProps {
  type: 'PF_HONORARIOS' | 'PF_PROCURACAO' | 'PF_HIPO' | 'PJ_HONORARIOS' | 'PJ_PROCURACAO' | 'PARTNERSHIP';
  data: any;
  zoom: number;
  manualOverride?: string | null;
}

const PDFPreview: React.FC<PDFPreviewProps> = ({ type, data, zoom, manualOverride }) => {
  const scale = zoom / 100;

  const replace = (text: string) => {
    if (!text) return "";
    let result = text;

    const formatCurrency = (val: string) => {
      if (!val || val === '0,00') return '________________';
      let clean = val.replace('R$', '').trim();
      return `R$ ${clean}`;
    };

    const formatDateString = (dateStr: string) => {
      if (!dateStr) return '________________';
      const parts = dateStr.split('-');
      if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
      return dateStr;
    };

    const mappings: Record<string, string> = {
      '/NOME/': data.nome || data.razaoSocial || data.gestor || '________________',
      '/ESTADO CIVIL/': data.estadoCivil || data.estadoCivilRep || '________________',
      '/PROFISSÃO/': data.profissao || data.profissaoRep || '________________',
      '/NACIONALIDADE/': data.nacionalidade || data.nacionalidadeRep || '________________',
      '/CPF/': data.cpf || data.cpfRep || '________________',
      '/Rua/': data.rua || data.enderecoRep || data.enderecoSede || '________________',
      '/COMPLEMENTO/': data.complemento ? `, ${data.complemento}` : '',
      '/CEP/': data.cep || data.cepRep || data.cepSede || '________________',
      '/NUMERO DE PROCESSO/': data.numProcesso || '________________',
      '/NUMEO DE PROCESSO/': data.numProcesso || '________________',
      '/VALOR TOTAL/': formatCurrency(data.valorTotal),
      '/ENTRADA/': formatCurrency(data.entrada),
      '/DATA DE ENTRADA/': formatDateString(data.dataEntrada),
      '/VEZES DE PARCELAS/': data.vezesParcelas || '________________',
      '/VALOR DA PARCELA/': formatCurrency(data.valorParcela),
      '/DATA DE PAGAMENTO DAS PARCELAS/': data.dataPagamentoParcelas || '________________',
      '/FORMA DE PAGAMENTO/': data.formaPagamento || '________________',
      '/ESTADO/': data.estado || data.estadoRep || data.estadoSede || '________________',
      '/DIA/': data.data?.split('-')[2] || new Date().getDate().toString().padStart(2, '0'),
      '/MÊS/': data.data?.split('-')[1] || (new Date().getMonth() + 1).toString().padStart(2, '0'),
      '/ANO/': data.data?.split('-')[0] || new Date().getFullYear().toString(),
      '/CIDADE/': data.cidade || data.cidadeRep || data.cidadeSede || '________________',
      '/NOME DA EMPRESA/': data.razaoSocial || '________________',
      '/CNPJ DA EMPRESA/': data.cnpj || '________________',
      '/ENDEREÇO DE EMPRESA/': data.enderecoSede || '________________',
      '/BAIRRO DO REPRESENTANDE/': data.bairroSede || '________________',
      '/CIDADE DA SEDE/': data.cidadeSede || '________________',
      '/CEP DO DA SEDE/': data.cepSede || '________________',
      '/NOME DO REPRESENTANTE/': data.nomeRepresentante || '________________',
      '/CPF REP/': data.cpfRep || '________________',
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

  const PaymentSchedule = () => {
    const installments = parseInt(data.vezesParcelas) || 0;
    const value = data.valorParcela;
    const dueDay = data.dataPagamentoParcelas;
    
    if (installments <= 0 || !value || !dueDay) return null;

    const schedules = [];
    const startDate = data.dataEntrada ? new Date(data.dataEntrada) : new Date();

    for (let i = 1; i <= installments; i++) {
      const date = new Date(startDate);
      date.setMonth(startDate.getMonth() + i);
      date.setDate(parseInt(dueDay) || 1);
      
      schedules.push({
        num: i,
        val: value,
        date: date.toLocaleDateString('pt-BR')
      });
    }

    return (
      <div className="my-6 border border-gray-100 rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-2 border-b border-gray-100 flex justify-between items-center">
          <span className="text-[9px] font-black uppercase tracking-widest text-[#9c7d2c]">Cronograma de Pagamentos</span>
          <span className="text-[8px] font-bold text-gray-400">Parcelamento Mensal</span>
        </div>
        <table className="w-full text-[9px] text-left">
          <thead>
            <tr className="bg-gray-50/30">
              <th className="px-4 py-2 border-b font-black text-gray-400 uppercase">Parcela</th>
              <th className="px-4 py-2 border-b font-black text-gray-400 uppercase">Valor</th>
              <th className="px-4 py-2 border-b font-black text-gray-400 uppercase">Data de Vencimento</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {schedules.map((s) => (
              <tr key={s.num}>
                <td className="px-4 py-1.5 font-bold text-gray-600">{s.num}ª Parcela</td>
                <td className="px-4 py-1.5 font-black text-gray-900">R$ {s.val}</td>
                <td className="px-4 py-1.5 font-bold text-gray-600 italic">{s.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const PageWrapper = ({ children, pageNumber }: { children?: React.ReactNode, pageNumber?: number }) => (
    <div 
      className="bg-white pdf-shadow p-12 mx-auto mb-8 origin-top transition-all duration-300 flex flex-col pdf-content-container font-contract print:shadow-none print:m-0 print:p-12 print:transform-none border border-gray-100 print:border-none relative" 
      style={{ 
        width: '595px', 
        height: '842px', 
        transform: `scale(${scale})`, 
        marginBottom: `${(scale - 1) * 842 + 20}px` 
      }}
    >
      <Header />
      <div className="flex-grow overflow-hidden">
        {children}
      </div>
      {pageNumber && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[8px] text-gray-300 font-bold print:hidden">
          Página {pageNumber}
        </div>
      )}
      <Footer />
    </div>
  );

  const renderContractPages = () => {
    if (manualOverride) {
      return (
        <PageWrapper>
          <div className="text-[10px] leading-[1.6] text-gray-800 text-justify whitespace-pre-wrap" 
               dangerouslySetInnerHTML={{ __html: replace(manualOverride) }} 
          />
        </PageWrapper>
      );
    }

    switch (type) {
      case 'PF_HONORARIOS':
      case 'PJ_HONORARIOS':
        const isPJ = type === 'PJ_HONORARIOS';
        const outorganteText = isPJ 
          ? 'OUTORGANTE: /NOME DA EMPRESA/, pessoa jurídica de direito privado, inscrita no CNPJ sob nº /CNPJ DA EMPRESA/, com sede na /ENDEREÇO DE EMPRESA/, /BAIRRO DO REPRESENTANDE/, /CIDADE DA SEDE/ - /ESTADO/ - CEP: /CEP DO DA SEDE/, neste ato representada por seu REPRESENTANTE LEGAL: Sr. /NOME DO REPRESENTANTE/, /NACIONALIDADE REP/, /PROFISSÃO REP/, /ESTADO CIVIL REP/, e CPF nº /CPF REP/, residente e domiciliado em /ENDEREÇO DO REPRESENTANDE/, /CIDADE DO REPRESENTANTE/ - /ESTADO/ - CEP: /CEP DO REPRESENTANTE/, pelo presente instrumento particular de procuração nomeia e constitui seu advogado:'
          : 'OUTORGANTE: /NOME/, /ESTADO CIVIL/, /PROFISSÃO/, /NACIONALIDADE/, CPF/MF de nº /CPF/, residente e domiciliado em /Rua/, /COMPLEMENTO/, - CEP: /CEP/, pelo presente instrumento particular de procuração nomeia e constitui seu advogado:';

        return (
          <>
            <PageWrapper pageNumber={1}>
              <div className="text-[10px] leading-[1.5] text-gray-800 text-justify">
                <h1 className="text-center font-black text-sm mb-6 uppercase underline tracking-tighter">CONTRATO DE HONORÁRIOS ADVOCATÍCIOS</h1>
                <p className="mb-4" dangerouslySetInnerHTML={{ __html: replace(outorganteText) }} />
                <p className="mb-4 p-4 bg-gray-50 border-l-4 border-[#9c7d2c] rounded-r-lg">
                  <span className="font-bold underline">OUTORGADO: Flafson Barbosa Borges</span>, OAB/RJ 213.777, com escritório profissional localizado na Av. Maria Teresa, 75, sala 328, Campo Grande - Rio de Janeiro, CEP: 23.050-160, e-mail: suporte@flafsonadvocacia.com, telefone/WhatsApp: (21) 99452-6345.
                </p>
                <h2 className="font-black uppercase mb-2 text-[11px] text-[#9c7d2c]">DO OBJETO DO CONTRATO</h2>
                <p className="mb-3" dangerouslySetInnerHTML={{ __html: replace('Cláusula 1ª. O presente instrumento tem como OBJETO a prestação de serviços advocatícios na ação judicial de revisão de cláusulas contratuais de N°: /NUMEO DE PROCESSO/ que lhe é movida a serem realizados nas instâncias ordinárias e em grau de recurso ao qual fica obrigada a parte contratante a verificar os fatos e fundamentos do processo através do site do tribunal de referência ou ir à serventia para verificar o seu processo e o ratificá-lo e não fazendo estará automaticamente ratificado o processo com seus fatos e fundamentos redigidos. Fica obrigada a parte contratante a tomar ciência do processo e seu número através do telefone do escritório ou pessoalmente ao mesmo.') }} />
                <h2 className="font-black uppercase mb-2 text-[11px] text-[#9c7d2c]">DAS ATIVIDADES</h2>
                <p className="mb-3">Cláusula 2ª. As atividades inclusas na prestação de serviço objeto deste instrumento são todas as inerentes à profissão, ou seja, todos os atos inerentes ao exercício da advocacia e constantes no Estatuto da Ordem dos Advogados do Brasil, bem como os especificados no instrumento de mandato.</p>
                <h2 className="font-black uppercase mb-2 text-[11px] text-[#9c7d2c]">DOS ATOS PROCESSUAIS</h2>
                <p className="mb-3">Cláusula 3ª. Havendo necessidade de contratação de outros profissionais, no decurso do processo, o CONTRATADO elaborará substabelecimento, indicando os advogados de seu conhecimento.</p>
              </div>
            </PageWrapper>

            <PageWrapper pageNumber={2}>
              <div className="text-[10px] leading-[1.5] text-gray-800 text-justify">
                <h2 className="font-black uppercase mb-2 text-[11px] text-[#9c7d2c]">DA COBRANÇA</h2>
                <p className="mb-3">Cláusula 4ª. As partes acordam que facultará ao CONTRATADO, o direito de realizar a cobrança dos honorários por todos os meios admitidos em direito.</p>
                <h2 className="font-black uppercase mb-2 text-[11px] text-[#9c7d2c]">DOS HONORÁRIOS E PAGAMENTO</h2>
                <p className="mb-3" dangerouslySetInnerHTML={{ __html: replace('Cláusula 5ª. Fará jus o contrato o valor de /VALOR TOTAL/ de honorários iniciais, pago /ENTRADA/ de entrada, até dia /DATA DE ENTRADA/ + /VEZES DE PARCELAS/ parcelas iguais no valor de /VALOR DA PARCELA/ todo dia /DATA DE PAGAMENTO DAS PARCELAS/. Formas de Pagamento aceitas: /FORMA DE PAGAMENTO/.') }} />
                
                <PaymentSchedule />

                <p className="mb-3 italic text-gray-500 text-[9px]">Caso não pague a mensalidade incidirá multa de 10% do valor devido e mais juros de 1% e correção pelo IGP-M ao mês.</p>
                <p className="mb-2">Parágrafo Primeiro. Os honorários de sucumbência serão revertidos integralmente ao CONTRATADO.</p>
                <p className="mb-2">Parágrafo Segundo. Caso a parte rescinda o contrato, os valores pagos não serão devolvidos por se tratar de honorários iniciais.</p>
                
                <div className="mt-8 pt-6 border-t border-gray-100 text-center space-y-10">
                  <p className="font-bold" dangerouslySetInnerHTML={{ __html: replace('/CIDADE/ - /ESTADO/, /DIA/ de /MÊS/ de /ANO/.') }} />
                  <div className="flex justify-around items-end pt-4">
                    <div className="flex flex-col items-center">
                      <div className="w-44 border-t-2 border-black mb-1"></div>
                      <p className="font-black uppercase text-[8px] tracking-tighter" dangerouslySetInnerHTML={{ __html: replace('/NOME/') }} />
                      <p className="text-[7px] font-bold text-gray-400 uppercase">OUTORGANTE</p>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-44 border-t-2 border-black mb-1"></div>
                      <p className="font-black uppercase text-[8px] tracking-tighter">FLAFSON BORGES BARBOSA</p>
                      <p className="text-[7px] font-bold text-[#9c7d2c] uppercase">OAB/RJ: 213.777</p>
                    </div>
                  </div>
                </div>
              </div>
            </PageWrapper>
          </>
        );
      case 'PF_PROCURACAO':
      case 'PJ_PROCURACAO':
        return (
          <PageWrapper>
            <div className="text-[11px] leading-relaxed text-gray-800 text-justify">
               <h1 className="text-center font-black text-base mb-10 underline uppercase tracking-tight">PROCURAÇÃO AD JUDICIA</h1>
               <p className="mb-6" dangerouslySetInnerHTML={{ __html: replace(type === 'PJ_PROCURACAO' 
                 ? 'OUTORGANTE: /NOME DA EMPRESA/, pessoa jurídica de direito privado, inscrita no CNPJ sob nº /CNPJ DA EMPRESA/, com sede na /ENDEREÇO DE EMPRESA/, /BAIRRO DO REPRESENTANDE/, /CIDADE DA SEDE/ - /ESTADO/ - CEP: /CEP DO DA SEDE/, neste ato representada por seu representante legal /NOME DO REPRESENTANTE/.'
                 : 'OUTORGANTE: /NOME/, /ESTADO CIVIL/, /PROFISSÃO/, /NACIONALIDADE/, portador do CPF nº /CPF/, residente e domiciliado em /Rua/, /CIDADE/ - /ESTADO/ - CEP: /CEP/.'
               )}} />
               <p className="mb-6 font-bold p-4 bg-gray-50 border-l-4 border-[#9c7d2c] rounded-r-lg">OUTORGADO: Flafson Borges Barbosa, inscrito na OAB/RJ sob o nº 213.777, com endereço profissional na Av. Maria Teresa, 75, sala 328, Campo Grande, Rio de Janeiro - RJ, CEP 23.050-160.</p>
               <h2 className="font-black uppercase mb-2 text-xs text-[#9c7d2c]">PODERES:</h2>
               <p className="mb-6" dangerouslySetInnerHTML={{ __html: replace('Pelo presente instrumento, o outorgante confere ao outorgado os amplos poderes da cláusula "ad judicia et extra", para o foro em geral, em especial para representar o outorgante no processo de N°: /NUMERO DE PROCESSO/, podendo propor ações, contestar, interpor recursos, transigir, firmar acordos, receber e dar quitação, substabelecer com ou sem reserva de poderes, e praticar todos os demais atos necessários ao bom e fiel desempenho do mandato.') }} />
               <div className="mt-20 text-center space-y-16">
                <p className="font-bold" dangerouslySetInnerHTML={{ __html: replace('/CIDADE/ - /ESTADO/, /DIA/ de /MÊS/ de /ANO/.') }} />
                <div className="flex flex-col items-center">
                  <div className="w-64 border-t-2 border-black mb-1"></div>
                  <p className="font-black uppercase text-[10px]" dangerouslySetInnerHTML={{ __html: replace('/NOME/') }} />
                  <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Outorgante</p>
                </div>
              </div>
            </div>
          </PageWrapper>
        );
      case 'PF_HIPO':
        return (
          <PageWrapper>
            <div className="text-[12px] leading-relaxed text-gray-800 text-justify">
               <h1 className="text-center font-black text-base mb-10 underline uppercase tracking-tight">DECLARAÇÃO DE HIPOSSUFICIÊNCIA</h1>
               <p className="mb-10" dangerouslySetInnerHTML={{ __html: replace('Eu, /NOME/, /ESTADO CIVIL/, /PROFISSÃO/, /NACIONALIDADE/, inscrito sob o CPF nº /CPF/, residente e domiciliado em /Rua/, /CIDADE/ - /ESTADO/ - CEP: /CEP/,') }} />
               <p className="mb-10">DECLARO para os devidos fins de direito e sob as penas da lei, em especial para o pedido de Gratuidade de Justiça no processo nº <span className="font-bold" dangerouslySetInnerHTML={{ __html: replace('/NUMERO DE PROCESSO/') }} />, que não possuo condições financeiras de arcar com o pagamento das custas processuais e honorários advocatícios sem prejuízo do meu sustento próprio ou de minha família.</p>
               <p className="mb-10 italic text-gray-500">Afirmo sob as penas da lei ser a expressão da verdade.</p>
               <div className="mt-24 text-center space-y-20">
                <p className="font-bold" dangerouslySetInnerHTML={{ __html: replace('/CIDADE/ - /ESTADO/, /DIA/ de /MÊS/ de /ANO/.') }} />
                <div className="flex flex-col items-center">
                  <div className="w-64 border-t-2 border-black mb-1"></div>
                  <p className="font-black uppercase text-[10px]" dangerouslySetInnerHTML={{ __html: replace('/NOME/') }} />
                  <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Declarante</p>
                </div>
              </div>
            </div>
          </PageWrapper>
        );
      case 'PARTNERSHIP':
        return (
          <PageWrapper>
            <div className="text-[12px] leading-relaxed text-gray-800">
               <h1 className="text-center font-black text-base mb-10 underline uppercase tracking-tight">TERMO DE PARCERIA PROFISSIONAL</h1>
               <div className="grid grid-cols-2 gap-4 mb-6">
                 <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                   <p className="text-[8px] font-black text-[#9c7d2c] uppercase mb-1">Gestor</p>
                   <p className="font-black text-xs">{data.gestor || '________________'}</p>
                 </div>
                 <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                   <p className="text-[8px] font-black text-[#9c7d2c] uppercase mb-1">Parceiro</p>
                   <p className="font-black text-xs">{data.parceiro || '________________'}</p>
                 </div>
               </div>
               <h2 className="font-black uppercase mb-2 text-xs text-[#9c7d2c]">DO OBJETO</h2>
               <p className="mb-4">O presente termo visa estabelecer parceria para atuação na área de <span className="font-bold underline">{data.tipoAcao || '________'}</span> referente aos interesses de <span className="font-bold italic">{data.clientes?.map((c: any) => ` ${c.nome}`).join(', ') || ' ________________'}</span>.</p>
               <h2 className="font-black uppercase mb-2 text-xs text-[#9c7d2c]">DA DIVISÃO DE HONORÁRIOS</h2>
               <p className="mb-8">As partes acordam que os honorários contratuais e sucumbenciais serão divididos na proporção de <span className="font-black text-[#9c7d2c]">{data.percentual || '____'}%</span> para o PARCEIRO e o remanescente para o GESTOR.</p>
               <div className="mt-32 flex justify-around text-center">
                <div className="flex flex-col items-center">
                   <p className="font-black uppercase mb-1 text-[10px]">{data.gestor || '________________'}</p>
                   <div className="w-56 border-t-2 border-black"></div>
                   <p className="text-[8px] mt-1 font-black text-[#9c7d2c] uppercase">GESTOR</p>
                </div>
                <div className="flex flex-col items-center">
                   <p className="font-black uppercase mb-1 text-[10px]">{data.parceiro || '________________'}</p>
                   <div className="w-56 border-t-2 border-black"></div>
                   <p className="text-[8px] mt-1 font-black text-[#9c7d2c] uppercase">PARCEIRO</p>
                </div>
              </div>
            </div>
          </PageWrapper>
        );
      default: return null;
    }
  };

  return (
    <div className="flex flex-col items-center w-full">
      {renderContractPages()}
    </div>
  );
};

export default PDFPreview;

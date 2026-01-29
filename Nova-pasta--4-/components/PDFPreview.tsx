
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

  const baseScale = Math.min(1.1, parentWidth / 595);
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

  const Header = () => (
    <div className="flex flex-col items-center mb-6">
      <div className="text-3xl font-extrabold text-[#9c7d2c]">FB</div>
      <div className="text-[7px] tracking-[0.4em] text-[#9c7d2c] font-black uppercase mt-1">FB Advocacia & Consultoria</div>
      <div className="w-24 h-[0.5px] bg-[#9c7d2c]/40 mt-3"></div>
    </div>
  );

  const Footer = () => (
    <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-end text-[6.5px] text-gray-400 font-bold uppercase tracking-widest">
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

  const PageWrapper = ({ children }: { children?: React.ReactNode }) => (
    <div className="flex flex-col items-center justify-center w-full" style={{ minHeight: `${scaledHeight}px` }}>
      <div className="relative shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] bg-white overflow-hidden print:shadow-none print:m-0 border border-gray-100" style={{ width: `${scaledWidth}px`, height: `${scaledHeight}px` }}>
        <div className="bg-white p-12 flex flex-col font-contract print:p-12" 
          style={{ width: '595px', height: '842px', transform: `scale(${finalScale})`, transformOrigin: 'top left', position: 'absolute', top: 0, left: 0 }}>
          <Header />
          <div className="flex-grow overflow-hidden flex flex-col">{children}</div>
          <Footer />
        </div>
      </div>
    </div>
  );

  const renderContract = () => {
    switch (type) {
      case 'PF_HONORARIOS':
        return (
          <>
            <PageWrapper>
              <div className="text-[10px] leading-[1.4] text-gray-800 text-justify space-y-3">
                <h1 className="text-center font-black text-xs mb-6 uppercase underline tracking-widest">CONTRATO DE HONORÁRIOS ADVOCATÍCIOS</h1>
                <p dangerouslySetInnerHTML={{ __html: replace('OUTORGANTE: /NOME/, /ESTADO CIVIL/, /PROFISSÃO/, /NACIONALIDADE/, CPF/MF de nº /CPF/, residente e domiciliado em /Rua/, /COMPLEMENTO/, - CEP: /CEP/.') }} />
                <p className="p-4 bg-gray-50 border-l-4 border-[#9c7d2c] rounded-r-xl">
                  <span className="font-bold text-black">OUTORGADO: Flafson Barbosa Borges</span>, inscrito na OAB/RJ sob o nº 213.777, com escritório profissional localizado na Av. Maria Teresa, 75, sala 328, Campo Grande - Rio de Janeiro, CEP: 23.050-160, e-mail: suporte@flafsonadvocacia.com, telefone/WhatsApp: (21) 99452-6345.
                </p>
                <section>
                  <h2 className="font-black uppercase mb-1.5 text-[10px] text-[#9c7d2c] tracking-wider">DO OBJETO DO CONTRATO</h2>
                  <p dangerouslySetInnerHTML={{ __html: replace('Cláusula 1ª. O presente instrumento tem como OBJETO a prestação de serviços advocatícios na ação judicial de revisão de cláusulas contratuais de N°: /NUMEO DE PROCESSO/ que lhe é movida a serem realizados nas instâncias ordinárias e em grau de recurso ao qual fica obrigada a parte contratante a verificar os fatos e fundamentos do processo através do site do tribunal de referência ou ir à serventia para verificar o seu processo e o ratificá-lo e não fazendo estará automaticamente ratificado o processo com seus fatos e fundamentos redigidos. Fica obrigada a parte contratante a tomar ciência do processo e seu número através do telefone do escritório ou pessoalmente ao mesmo.') }} />
                </section>
                <section>
                  <h2 className="font-black uppercase mb-1.5 text-[10px] text-[#9c7d2c] tracking-wider">DAS ATIVIDADES</h2>
                  <p>Cláusula 2ª. As atividades inclusas na prestação de serviço objeto deste instrumento são todas aquelas inerentes à profissão, ou seja, todos os atos inerentes ao exercício da advocacia e aqueles constantes no Estatuto da Ordem dos Advogados do Brasil, bem como os especificados no instrumento de mandato. Atividades que fazem parte além as da procuração são a de atendimento ao cliente inicial, redigir a petição inicial, fazer o cálculo, distribuição da peça judicial, atendimento ao cliente por telefone diariamente em todos os dias úteis do ano, atendimento presencial quando solicitado por e-mail suporte@flafsonadvocacia.com ou telefone acima especificado, acompanhamento do processo judicial, petições interlocutórias no processo.</p>
                </section>
                <section>
                  <h2 className="font-black uppercase mb-1.5 text-[10px] text-[#9c7d2c] tracking-wider">DOS ATOS PROCESSUAIS</h2>
                  <p>Cláusula 3ª. Havendo necessidade de contratação de outros profissionais, no decurso do processo, o CONTRATADO elaborará substabelecimento, indicando os advogados de seu conhecimento.</p>
                </section>
                <section>
                  <h2 className="font-black uppercase mb-1.5 text-[10px] text-[#9c7d2c] tracking-wider">DA COBRANÇA</h2>
                  <p>Cláusula 4ª. As partes acordam que facultará ao CONTRATADO, o direito de realizar a cobrança dos honorários por todos os meios admitidos em direito.</p>
                </section>
              </div>
            </PageWrapper>
            <PageWrapper>
              <div className="text-[10px] leading-[1.4] text-gray-800 text-justify space-y-3">
                <section>
                  <h2 className="font-black uppercase mb-1.5 text-[10px] text-[#9c7d2c] tracking-wider">DOS HONORÁRIOS</h2>
                  <p dangerouslySetInnerHTML={{ __html: replace('Cláusula 5ª. Fará jus o contrato o valor de /VALOR TOTAL/ de honorários iniciais, pago /ENTRADA/ de entrada, até dia /DATA DE ENTRADA/ + /VEZES DE PARCELAS/ parcelas iguais no valor de /VALOR DA PARCELA/ todo dia /DATA DE PAGAMENTO DAS PARCELAS/.<br/><br/>Caso não pague a mensalidade ou prestação incidirá multa de 10% do valor devido e mais juros de 1% e correção pelo IGP-M ao mês (na falta do índice do IGP-M será adotado outro índice oficial que vier a ser adotado em seu lugar ou equivalente).') }} />
                  <div className="mt-3 space-y-1.5 text-[9px]">
                    <p>Parágrafo Primeiro. Os honorários de sucumbência, que são pagos pela parte contrária, serão revertidos integralmente ao CONTRATADO.</p>
                    <p>Parágrafo Segundo - Caso a parte rescinda o contrato de honorários o mesmo terá que enviar uma carta ao escritório com o pedido e a parte contratada ficará com os valores já pagos e os devidos do contrato, por se tratar de honorários iniciais.</p>
                    <p>Parágrafo Terceiro. Caso haja morte ou incapacidade civil do CONTRATADO, seus sucessores ou representante legal receberão os honorários.</p>
                    <p>Parágrafo Quarto. O contratado está autorizado a receber pelo contratante e dar quitação ao processo e retirar a sua parte dos honorários (trinta porcento do total) diretamente do valor que for recebido e terá o prazo de 7 dias uteis para efetuar o pagamento do valor devido ao contratante sem incidir juros e correção monetária, a partir da confirmação da indenização recebida.</p>
                    <p>Parágrafo Quinto. Caso tenha que pagar Imposto de Renda ou qualquer outro imposto ou que o mesmo seja automaticamente deduzido no valor que receba de indenizações materiais, morais ou qualquer outra natureza os mesmos serão pagos exclusivamente pela parte contratante.</p>
                  </div>
                </section>
                <section>
                  <p>Cláusula 6ª. Havendo acordo entre o CONTRATANTE e a parte contrária, tal fato não prejudicará o recebimento dos honorários contratados e da sucumbência.</p>
                  <p>Cláusula 7ª. O CONTRATANTE concorda que os honorários advocatícios referentes às custas iniciais dos serviços prestados serão pagos de forma antecipada, no caso de formalização de qualquer acordo. O valor total dos honorários será estipulado na clausula 5°, e deverá ser quitado antes da celebração do referido acordo.</p>
                </section>
                <section>
                  <h2 className="font-black uppercase mb-1.5 text-[10px] text-[#9c7d2c] tracking-wider">DA RESCISÃO</h2>
                  <p>Cláusula 8ª. O presente contrato poderá ser rescindido por qualquer das partes, mediante aviso prévio, por escrito com aviso de recebimento, com 30 (trinta) dias de antecedência, incidindo nesse caso a totalidade dos honorários contratados.</p>
                </section>
                <section>
                  <h2 className="font-black uppercase mb-1.5 text-[10px] text-[#9c7d2c] tracking-wider">DOS DADOS</h2>
                  <p>Cláusula 9ª. O contratante autoriza desde já a disponibilização dos dados somente e exclusivamente para os colaboradores do escritório contratado e a única exceção será caso fique inadimplente com o escritório contratado fica autorizado a disponibilizar os dados aos serviços de cadastros de inadimplentes como o SPC, SERASA e PROTESTO.</p>
                </section>
                <section>
                  <h2 className="font-black uppercase mb-1.5 text-[10px] text-[#9c7d2c] tracking-wider">DO FORO</h2>
                  <p>Cláusula 10ª. Para dirimir quaisquer controvérsias oriundas do CONTRATO, as partes elegem o foro do Centro da Cidade (comarca da capital) da comarca do Rio de Janeiro, Rio de Janeiro.</p>
                </section>
                
                <div className="mt-12 text-center space-y-12">
                   <p className="font-bold text-[10px]" dangerouslySetInnerHTML={{ __html: replace('/CIDADE/, /DIA/ de /MÊS/ de /ANO/.') }} />
                   <div className="flex justify-around items-end pt-8">
                     <div className="text-center space-y-1">
                       <div className="w-44 border-t border-black"></div>
                       <p className="text-[8px] font-black uppercase" dangerouslySetInnerHTML={{ __html: replace('/NOME/') }}></p>
                       <p className="text-[7px] text-gray-400 font-bold uppercase">(OUTORGANTE)</p>
                     </div>
                     <div className="text-center space-y-1">
                       <div className="w-44 border-t border-[#9c7d2c]"></div>
                       <p className="text-[8px] font-black uppercase text-[#9c7d2c]">FLAFSON BORGES BARBOSA</p>
                       <p className="text-[7px] text-[#9c7d2c] font-bold uppercase">OAB/RJ 213.777</p>
                     </div>
                   </div>
                </div>
              </div>
            </PageWrapper>
          </>
        );

      case 'PJ_HONORARIOS':
        return (
          <>
            <PageWrapper>
              <div className="text-[10px] leading-[1.35] text-gray-800 text-justify space-y-3">
                <h1 className="text-center font-black text-xs mb-6 uppercase underline tracking-widest">CONTRATO DE HONORÁRIOS ADVOCATÍCIOS</h1>
                <p dangerouslySetInnerHTML={{ __html: replace('OUTORGANTE: /NOME DA EMPRESA/, pessoa jurídica de direito privado, inscrita no CNPJ sob nº /CNPJ DA EMPRESA/, com sede na /ENDEREÇO DE EMPRESA/, /BAIRRO DO REPRESENTANDE/, /CIDADE DA SEDE/ - /ESTADO DA CEP/ - CEP: /CEP DO DA SEDE/, endereço eletrônico desconhecido, neste ato representada por seu:') }} />
                <p dangerouslySetInnerHTML={{ __html: replace('REPRESENTANTES LEGAIS: Sr. /NOME DO REPRESENTANTE/, /NACIONALIDADE/, /PROFISSÃO/, /ESTADO CIVIL/, e CPF nº /CPF/, residente e domiciliado em /ENDEREÇO DO REPRESENTANDE/, /CIDADE DO REPRESENTANTE/ - /ESTADO DO REPRESENTANTE/ - CEP: /CEP DO REPRESENTANTE/.') }} />
                <p className="p-4 bg-gray-50 border-l-4 border-[#9c7d2c] rounded-r-xl">
                  <span className="font-bold text-black">OUTORGADO: Flafson Barbosa Borges</span>, inscrito na OAB/RJ sob o nº 213.777, com escritório profissional localizado na Av. Maria Teresa, 75, sala 328, Campo Grande - Rio de Janeiro, CEP: 23.050-160, e-mail: suporte@flafsonadvocacia.com, telefone/WhatsApp: (21) 99452-6345.
                </p>
                <section>
                  <h2 className="font-black uppercase mb-1.5 text-[10px] text-[#9c7d2c] tracking-wider">DO OBJETO DO CONTRATO</h2>
                  <p dangerouslySetInnerHTML={{ __html: replace('Cláusula 1ª. O presente instrumento tem como OBJETO a prestação de serviços advocatícios na ação judicial de revisão de cláusulas contratuais de N°: /NUMEO DE PROCESSO/ que lhe é movida a serem realizados nas instâncias ordinárias e em grau de recurso ao qual fica obrigada a parte contratante a verificar os fatos e fundamentos do processo através do site do tribunal de referência ou ir à serventia para verificar o seu processo e o ratificá-lo e não fazendo estará automaticamente ratificado o processo com seus fatos e fundamentos redigidos. Fica obrigada a parte contratante a tomar ciência do processo e seu número através do telefone do escritório ou pessoalmente ao mesmo.') }} />
                </section>
                <section>
                  <h2 className="font-black uppercase mb-1.5 text-[10px] text-[#9c7d2c] tracking-wider">DAS ATIVIDADES</h2>
                  <p>Cláusula 2ª. As atividades inclusas na prestação de serviço objeto deste instrumento são todas aquelas inerentes à profissão, ou seja, todos os atos inerentes ao exercício da advocacia e aqueles constantes no Estatuto da Ordem dos Advogados do Brasil, bem como os especificados no instrumento de mandato. Atividades que fazem parte além as da procuração são a de atendimento ao cliente inicial, redigir a petição inicial, fazer o cálculo, distribuição da peça judicial, atendimento ao cliente por telefone diariamente em todos os dias úteis do ano, atendimento presencial quando solicitado por e-mail suporte@flafsonadvocacia.com ou telefone acima especificado, acompanhamento do processo judicial, petições interlocutórias no processo.</p>
                </section>
              </div>
            </PageWrapper>
            <PageWrapper>
              <div className="text-[10px] leading-[1.35] text-gray-800 text-justify space-y-3">
                <section>
                  <h2 className="font-black uppercase mb-1.5 text-[10px] text-[#9c7d2c] tracking-wider">DOS HONORÁRIOS</h2>
                  <p dangerouslySetInnerHTML={{ __html: replace('Cláusula 5ª. Fará jus o contrato o valor de /VALOR TOTAL/ de honorários iniciais. <br/>Forma de pagamento: /FORMA DE PAGAMENTO/, sendo /ENTRADA/ de entrada, até dia /DATA DE ENTRADA/ + /VEZES DE PARCELAS/ parcelas iguais no valor de /VALOR DA PARCELA/ todo dia /DATA DE PAGAMENTO DAS PARCELAS/. <br/><br/>Caso não pague a mensalidade ou prestação incidirá multa de 10% do valor devido e mais juros de 1% e correção pelo IGP-M ao mês.') }} />
                </section>
                <div className="space-y-1.5 text-[8.5px] mb-4">
                    <p>Parágrafo Primeiro. Os honorários de sucumbência serão revertidos integralmente ao CONTRATADO.</p>
                    <p>Parágrafo Segundo - Rescisão exige envio de carta ao escritório.</p>
                    <p>Parágrafo Quarto. O contratado está autorizado a receber pelo contratante e retirar sua parte dos honorários (trinta porcento do total) diretamente do valor recebido.</p>
                </div>
                <section>
                  <h2 className="font-black uppercase mb-1.5 text-[10px] text-[#9c7d2c] tracking-wider">DA RESCISÃO E FORO</h2>
                  <p>Cláusula 8ª. Rescisão mediante aviso prévio de 30 dias. Cláusula 10ª. Foro do Centro da Cidade da comarca do Rio de Janeiro.</p>
                </section>
                <div className="mt-20 text-center space-y-12">
                   <p className="font-bold text-[10px]" dangerouslySetInnerHTML={{ __html: replace('/ESTADO/, /DIA/ de /MÊS/ de /ANO/.') }} />
                   <div className="flex justify-around items-end pt-12">
                     <div className="text-center space-y-1">
                       <div className="w-44 border-t border-black"></div>
                       <p className="text-[8px] font-black uppercase" dangerouslySetInnerHTML={{ __html: replace('/NOME DA EMPRESA/') }}></p>
                       <p className="text-[7px] text-gray-400 font-bold uppercase">(OUTORGANTE)</p>
                     </div>
                     <div className="text-center space-y-1">
                       <div className="w-44 border-t border-[#9c7d2c]"></div>
                       <p className="text-[8px] font-black uppercase text-[#9c7d2c]">FLAFSON BORGES BARBOSA</p>
                       <p className="text-[7px] text-[#9c7d2c] font-bold uppercase">OAB/RJ 213.777</p>
                     </div>
                   </div>
                </div>
              </div>
            </PageWrapper>
          </>
        );

      case 'PF_PROCURACAO':
      case 'PJ_PROCURACAO':
        const isPJ = type === 'PJ_PROCURACAO';
        const procuracaoText = isPJ 
          ? 'OUTORGANTE: /NOME DA EMPRESA/, pessoa jurídica de direito privado, inscrita no CNPJ sob nº /CNPJ/, com sede na /ENDEREÇO DA SEDE/, /CIDADE DA SEDE/ - /ESTADO DA SEDE/ - CEP: /CEP DA SEDE/, neste ato representada por seu: /NOME/, /ESTADO CIVIL/, /PROFISSÃO/, /NACIONALIDADE/, CPF/MF de nº /CPF/, residente e domiciliado em /Rua/, /COMPLEMENTO/, - CEP: /CEP/, pelo presente instrumento particular de procuração nomeia e constitui seu advogado:'
          : 'OUTORGANTE: /NOME/, /ESTADO CIVIL/, /PROFISSÃO/, /NACIONALIDADE/, CPF/MF de nº /CPF/, residente e domiciliado em /Rua/, /COMPLEMENTO/, - CEP: /CEP/, pelo presente instrumento particular de procuração nomeia e constitui seu advogado:';
        
        return (
          <PageWrapper>
            <div className="text-[9.5px] leading-[1.55] text-gray-800 text-justify">
               <h1 className="text-center font-black text-xs mb-6 underline uppercase tracking-widest">PROCURAÇÃO</h1>
               <p className="mb-3.5" dangerouslySetInnerHTML={{ __html: replace(procuracaoText) }} />
               <p className="mb-3.5 font-bold p-3.5 bg-gray-50 border-l-4 border-[#9c7d2c] rounded-r-xl">
                 OUTORGADO: Flafson Borges Barbosa, OAB/RJ 213.777, com escritório profissional localizado na Av. Maria Teresa, 75, sala 328, Campo Grande - Rio de Janeiro, CEP: 23.050-160, e-mail: suporte@flafsonadvocacia.com, telefone/WhatsApp: (21) 99452-6345.
               </p>
               <p className="mb-3.5" dangerouslySetInnerHTML={{ __html: replace('<span class="font-bold text-[#9c7d2c] uppercase tracking-wider">OBJETO:</span> Representar o outorgante no processo judicial de revisão de cláusulas contratuais de N°: /NUMERO DE PROCESSO/, promovendo a defesa dos seus direitos e interesses, podendo, para tanto, propor quaisquer ações, medidas incidentais, acompanhar processos administrativos e/ou judiciais em qualquer Juízo, Instância, Tribunal ou Repartição Pública.') }} />
               <p className="mb-6"><span className="font-bold text-[#9c7d2c] uppercase tracking-wider">PODERES:</span> Por este instrumento particular de procuração, constituo meus procuradores outorgados, concedendo-lhe os poderes inerentes da cláusula, poderes da cláusulas ad judicia e especiais, representar o outorgante perante a qualquer Tribunal de Justiça do Brasil, STF, STJ, TRT, TRF, podendo propor qualquer tipo de ação, podendo ainda para tanto praticar os atos de acordar, discordar, transigir, negociar, juntar, dar quitação e receber, receber os honorários contratuais separadamente firmados de trinta por cento do valor de qualquer indenização deste processo diretamente no processo incluindo juros e correção monetária, firmar compromissos, concordar e impugnar cálculos, renunciar e desistir, substabelecer com ou sem reservas de poderes, sendo o presente instrumento de mandato oneroso e contratual, dando tudo por bom e valioso, afim de praticar todos os demais atos necessários ao fiel desempenho deste mandato.</p>
               <div className="text-center mt-12 space-y-12">
                  <p className="font-bold text-[9.5px]" dangerouslySetInnerHTML={{ __html: replace('/CIDADE/, /DIA/ de /MÊS/ de /ANO/.') }} />
                  <div className="flex flex-col items-center">
                    <div className="w-56 border-t border-black mb-1"></div>
                    <p className="font-black uppercase text-[9px]" dangerouslySetInnerHTML={{ __html: replace('/NOME/') }} />
                    <p className="text-[6.5px] font-bold text-gray-400 uppercase tracking-widest">(Outorgante)</p>
                  </div>
               </div>
            </div>
          </PageWrapper>
        );
      case 'PF_HIPO':
        return (
          <PageWrapper>
            <div className="text-[10.5px] leading-[1.7] text-gray-800 text-justify">
               <h1 className="text-center font-black text-xs mb-10 underline uppercase tracking-widest">DECLARAÇÃO DE HIPOSSUFICIÊNCIA</h1>
               <p className="mb-7" dangerouslySetInnerHTML={{ __html: replace('Eu, /NOME/, /ESTADO CIVIL/, /PROFISSÃO/, /NACIONALIDADE/, CPF/MF de nº /CPF/, residente e domiciliado em /Rua/, /COMPLEMENTO/, - CEP: /CEP/, DECLARO, para os devidos fins, sob as penas da lei, que não possuo condições financeiras de arcar com as custas processuais e honorários advocatícios sem prejuízo do meu sustento e de minha família, razão pela qual requeiro os benefícios da justiça gratuita, nos termos do artigo 98 do Código de Processo Civil.') }} />
               <p className="mb-10 text-center font-medium italic text-gray-500">Por ser expressão da verdade, firmo a presente.</p>
               <div className="text-center mt-24 space-y-16">
                  <p className="font-bold uppercase text-[9.5px] tracking-widest" dangerouslySetInnerHTML={{ __html: replace('/ESTADO/, /DIA/ de /MÊS/ de /ANO/.') }} />
                  <div className="flex flex-col items-center">
                    <div className="w-64 border-t border-black mb-1.5"></div>
                    <p className="font-black uppercase text-[10px] tracking-widest" dangerouslySetInnerHTML={{ __html: replace('/NOME/') }} />
                    <p className="text-[7.5px] font-bold text-gray-400 uppercase tracking-widest">(Outorgante)</p>
                  </div>
               </div>
            </div>
          </PageWrapper>
        );
      default: return null;
    }
  };

  return <div className="flex flex-col items-center w-full space-y-10 pb-20">{renderContract()}</div>;
};

export default PDFPreview;

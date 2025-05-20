import PageBanner from "../components/PageBanner";

const Novidades = () => {
  return (
    <div className="bg-fundo flex flex-col min-h-screen">
      {/* Espaço para cabeçalho fixo */}
      <div className="bg-[#010409] h-[104px]" />

      {/* Conteúdo da página */}
      <main className="flex-grow">
        <PageBanner pageName="Acompanhe nosso Instagram" />

        <section className="flex flex-col items-center px-4 py-12 max-w-7xl mx-auto">
          {/* Widget Elfsight */}
          <div className="w-full max-w-4xl overflow-hidden">
            <div
              className="elfsight-app-dff41f3b-a57a-498f-8a83-b82225a70ce8"
              data-elfsight-app-lazy
            ></div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Novidades;

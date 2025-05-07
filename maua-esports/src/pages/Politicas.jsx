import { useState, useEffect } from "react";
import PageBannner from "../components/PageBanner";
import Menu from "../components/PoliticasTermos/Menu";
import ContentSection from "../components/PoliticasTermos/ContentSection";

const Politicas = () => {
  const [activeSection, setActiveSection] = useState("");
  const [sections, setSections] = useState([]);
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState("");

  // Função para gerar ID a partir do título
  const generateId = (title) => {
    return title
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
  };

  // Carregar seções e seção ativa do localStorage
  useEffect(() => {
    const savedSections = localStorage.getItem("policy-sections");
    const savedActiveSection = localStorage.getItem("active-policy-section");

    if (savedSections) {
      const parsedSections = JSON.parse(savedSections);
      setSections(parsedSections);

      // Se temos uma seção ativa salva, usamos ela
      if (
        savedActiveSection &&
        parsedSections.some((section) => section.id === savedActiveSection)
      ) {
        setActiveSection(savedActiveSection);
      } else if (parsedSections.length > 0) {
        // Caso contrário, use a primeira seção
        setActiveSection(parsedSections[0].id);
      }
    } else {
      // Seções padrão
      const defaultSections = [
        { id: "privacidade", title: "Política de Privacidade" },
        { id: "cookies", title: "Política de Cookies" },
        { id: "termos", title: "Termos de Serviço" },
      ];
      setSections(defaultSections);
      setActiveSection(defaultSections[0].id);
      localStorage.setItem("policy-sections", JSON.stringify(defaultSections));
      localStorage.setItem("active-policy-section", defaultSections[0].id);
    }
  }, []);

  // Salvar seções no localStorage quando houver mudanças
  useEffect(() => {
    if (sections.length > 0) {
      localStorage.setItem("policy-sections", JSON.stringify(sections));
    }
  }, [sections]);

  // Salvar seção ativa quando ela for alterada
  useEffect(() => {
    if (activeSection) {
      localStorage.setItem("active-policy-section", activeSection);
    }
  }, [activeSection]);

  const handleAddSection = () => {
    setIsAddingSection(true);
  };

  const handleSaveNewSection = () => {
    if (newSectionTitle.trim() === "") {
      alert("Digite um título para a seção");
      return;
    }

    const newId = generateId(newSectionTitle);

    // Verificar se ID já existe
    if (sections.some((section) => section.id === newId)) {
      alert("Já existe uma seção com título similar. Escolha outro título.");
      return;
    }

    const newSection = { id: newId, title: newSectionTitle };
    setSections([...sections, newSection]);
    setIsAddingSection(false);
    setNewSectionTitle("");
    setActiveSection(newId);
  };

  const handleDeleteSection = (idToDelete) => {
    if (confirm("Tem certeza que deseja excluir esta seção?")) {
      const updatedSections = sections.filter(
        (section) => section.id !== idToDelete
      );
      setSections(updatedSections);

      // Remover conteúdo do localStorage
      localStorage.removeItem(`termos-politicas-${idToDelete}`);

      // Se a seção ativa foi excluída, mudar para a primeira seção disponível
      if (idToDelete === activeSection && updatedSections.length > 0) {
        setActiveSection(updatedSections[0].id);
      }
    }
  };

  const handleEditSection = (id, newTitle) => {
    // Se o título não mudou, não faz nada
    const currentSection = sections.find((s) => s.id === id);
    if (currentSection.title === newTitle) {
      return;
    }

    // Gere o novo ID baseado no novo título
    const newId = generateId(newTitle);

    // Verifique se o novo ID já existe (exceto para a própria seção)
    if (sections.some((section) => section.id === newId && section.id !== id)) {
      alert("Já existe uma seção com título similar. Escolha outro título.");
      return;
    }

    // Obtenha o conteúdo antigo
    const oldContent = localStorage.getItem(`termos-politicas-${id}`);

    // Atualize a seção com novo título e ID
    const updatedSections = sections.map((section) => {
      if (section.id === id) {
        return { ...section, id: newId, title: newTitle };
      }
      return section;
    });

    // Salve o conteúdo com o novo ID e remova o antigo
    if (oldContent) {
      localStorage.setItem(`termos-politicas-${newId}`, oldContent);
      localStorage.removeItem(`termos-politicas-${id}`);
    }

    // Atualize o estado
    setSections(updatedSections);

    // Se a seção ativa foi editada, atualize o activeSection
    if (id === activeSection) {
      setActiveSection(newId);
    }
  };

  const handleCancelAdd = () => {
    setIsAddingSection(false);
    setNewSectionTitle("");
  };

  return (
    <div className="min-h-screen bg-[#0D1117]">
      <div className="bg-[#010409] h-[104px]">.</div>

      <PageBannner pageName="Políticas e Termos" />

      <div className="mx-14 px-4">
        <div className="flex flex-col md:flex-row gap-10 mt-19">
          <div className="md:w-1/3">
            <Menu
              sections={sections}
              activeSection={activeSection}
              setActiveSection={setActiveSection}
              onDelete={handleDeleteSection}
              onEdit={handleEditSection}
              onAddClick={handleAddSection}
              isAddingSection={isAddingSection}
              newSectionTitle={newSectionTitle}
              setNewSectionTitle={setNewSectionTitle}
              onSaveNewSection={handleSaveNewSection}
              onCancelAdd={handleCancelAdd}
            />
          </div>

          <div className="md:w-3/4">
            {sections.map((section) => (
              <ContentSection
                key={section.id}
                id={section.id}
                title={section.title}
                isActive={activeSection === section.id}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Politicas;

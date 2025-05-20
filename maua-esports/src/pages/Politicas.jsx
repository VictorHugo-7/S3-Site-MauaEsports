import { useState, useEffect } from "react";
import { useMsal } from "@azure/msal-react";
import { useNavigate } from "react-router-dom";
import PageBanner from "../components/PageBanner";
import Menu from "../components/politicas/Menu";
import ContentSection from "../components/politicas/ContentSection";
import AlertaOk from "../components/AlertaOk";
import AlertaErro from "../components/AlertaErro";

const API_BASE_URL = "http://localhost:3000";

const Politicas = () => {
  const { instance } = useMsal();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("");
  const [sections, setSections] = useState([]);
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [sectionToDelete, setSectionToDelete] = useState(null);
  const [userRole, setUserRole] = useState("");
  const [authChecked, setAuthChecked] = useState(false);

  // Função para gerar ID a partir do título
  const generateId = (title) => {
    return title
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
  };

  // Carregar dados do usuário e seções
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const account = instance.getActiveAccount();

        if (account) {
          const response = await fetch(
            `${API_BASE_URL}/usuarios/por-email?email=${encodeURIComponent(
              account.username
            )}`
          );
          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || "Erro ao carregar dados do usuário");
          }

          setUserRole(data.usuario.tipoUsuario);
        }

        setAuthChecked(true);
        loadSections();
      } catch (err) {
        console.error("Erro ao carregar dados do usuário:", err);
        setErrorMessage("Erro ao carregar dados do usuário");
        navigate("/nao-autorizado");
      }
    };

    loadUserData();
  }, [instance, navigate]);

  // Carregar seções do localStorage
  const loadSections = () => {
    const savedSections = localStorage.getItem("policy-sections");
    const savedActiveSection = localStorage.getItem("active-policy-section");

    if (savedSections) {
      const parsedSections = JSON.parse(savedSections);
      setSections(parsedSections);

      if (
        savedActiveSection &&
        parsedSections.some((section) => section.id === savedActiveSection)
      ) {
        setActiveSection(savedActiveSection);
      } else if (parsedSections.length > 0) {
        setActiveSection(parsedSections[0].id);
      }
    } else {
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
  };

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
    if (userRole !== "Administrador" && userRole !== "Administrador Geral") {
      setErrorMessage("Você não tem permissão para adicionar seções");
      return;
    }
    setIsAddingSection(true);
  };

  const handleSaveNewSection = () => {
    if (userRole !== "Administrador" && userRole !== "Administrador Geral") {
      setErrorMessage("Você não tem permissão para adicionar seções");
      return;
    }

    if (newSectionTitle.trim() === "") {
      setErrorMessage("Digite um título para a seção");
      return;
    }

    const newId = generateId(newSectionTitle);

    if (sections.some((section) => section.id === newId)) {
      setErrorMessage(
        "Já existe uma seção com título similar. Escolha outro título."
      );
      return;
    }

    const newSection = { id: newId, title: newSectionTitle };
    setSections([...sections, newSection]);
    setSuccessMessage("Seção criada com sucesso!");
    setIsAddingSection(false);
    setNewSectionTitle("");
    setActiveSection(newId);
  };

  const handleDeleteSection = (id) => {
    if (userRole !== "Administrador" && userRole !== "Administrador Geral") {
      setErrorMessage("Você não tem permissão para excluir seções");
      return;
    }
    setSectionToDelete(id);
    setShowConfirmModal(true);
  };

  const confirmDelete = () => {
    if (userRole !== "Administrador" && userRole !== "Administrador Geral") {
      setErrorMessage("Você não tem permissão para excluir seções");
      return;
    }
    const idToDelete = sectionToDelete;
    const updatedSections = sections.filter(
      (section) => section.id !== idToDelete
    );
    setSections(updatedSections);

    localStorage.removeItem(`termos-politicas-${idToDelete}`);

    if (idToDelete === activeSection && updatedSections.length > 0) {
      setActiveSection(updatedSections[0].id);
    }

    setSuccessMessage("Seção excluída com sucesso!");
    setShowConfirmModal(false);
    setSectionToDelete(null);
  };

  const cancelDelete = () => {
    setShowConfirmModal(false);
    setSectionToDelete(null);
  };

  const handleEditSection = (id, newTitle) => {
    if (userRole !== "Administrador" && userRole !== "Administrador Geral") {
      setErrorMessage("Você não tem permissão para editar seções");
      return;
    }
    const currentSection = sections.find((s) => s.id === id);
    if (currentSection.title === newTitle) {
      return;
    }

    const newId = generateId(newTitle);

    if (sections.some((section) => section.id === newId && section.id !== id)) {
      setErrorMessage(
        "Já existe uma seção com título similar. Escolha outro título."
      );
      return;
    }

    const oldContent = localStorage.getItem(`termos-politicas-${id}`);

    const updatedSections = sections.map((section) => {
      if (section.id === id) {
        return { ...section, id: newId, title: newTitle };
      }
      return section;
    });

    if (oldContent) {
      localStorage.setItem(`termos-politicas-${newId}`, oldContent);
      localStorage.removeItem(`termos-politicas-${id}`);
    }

    setSections(updatedSections);
    setSuccessMessage("Seção atualizada com sucesso!");

    if (id === activeSection) {
      setActiveSection(newId);
    }
  };

  const handleCancelAdd = () => {
    setIsAddingSection(false);
    setNewSectionTitle("");
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-[#0D1117] text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-azul-claro"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D1117]">
      <div className="bg-[#010409] h-[104px]"></div>

      <PageBanner pageName="Políticas e Termos" />

      <div className="mx-14 px-4">
        <AlertaOk mensagem={successMessage} />
        <AlertaErro mensagem={errorMessage} />

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
              setSuccessMessage={setSuccessMessage}
              setErrorMessage={setErrorMessage}
              isAdminMode={
                userRole === "Administrador" ||
                userRole === "Administrador Geral"
              }
            />
          </div>

          <div className="md:w-3/4">
            {sections.map((section) => (
              <ContentSection
                key={section.id}
                id={section.id}
                title={section.title}
                isActive={activeSection === section.id}
                setSuccessMessage={setSuccessMessage}
                setErrorMessage={setErrorMessage}
                isAdminMode={
                  userRole === "Administrador" ||
                  userRole === "Administrador Geral"
                }
              />
            ))}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#1E252F] p-6 rounded-xl shadow-lg text-white">
            <p className="mb-4">Tem certeza que deseja excluir esta seção?</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={cancelDelete}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Politicas;

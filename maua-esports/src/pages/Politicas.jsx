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
  const [newSectionDescription, setNewSectionDescription] = useState("");
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [sectionToDelete, setSectionToDelete] = useState(null);
  const [userRole, setUserRole] = useState("");
  const [authChecked, setAuthChecked] = useState(false);

  // Limpar alertas após 3 segundos
  useEffect(() => {
    if (successMessage || errorMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
        setErrorMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, errorMessage]);

  // Carregar dados do usuário e seções
  useEffect(() => {
    const loadUserDataAndSections = async () => {
      try {
        const account = instance.getActiveAccount();
        let token;

        if (account) {
          const response = await instance.acquireTokenSilent({
            scopes: ["User.Read"],
            account,
          });
          token = response.accessToken;

          const userResponse = await fetch(
            `${API_BASE_URL}/usuarios/por-email?email=${encodeURIComponent(account.username)}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          const userData = await userResponse.json();

          if (!userResponse.ok) {
            throw new Error(userData.error || "Erro ao carregar dados do usuário");
          }

          setUserRole(userData.usuario.tipoUsuario);
        }

        // Carregar seções da API
        const sectionsResponse = await fetch(`${API_BASE_URL}/politicas`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const sectionsData = await sectionsResponse.json();

        if (!sectionsResponse.ok) {
          throw new Error(sectionsData.error || "Erro ao carregar políticas");
        }

        if (!sectionsData.success || !Array.isArray(sectionsData.politicas)) {
          throw new Error("Formato de dados inválido");
        }

        const formattedSections = sectionsData.politicas.map((politica) => ({
          id: politica._id,
          title: politica.titulo,
          description: politica.descricao,
        }));

        setSections(formattedSections);
        setActiveSection(formattedSections[0]?.id || "");

        setAuthChecked(true);
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
        setErrorMessage("Erro ao carregar dados. Tente novamente.");
        if (err.message.includes("Erro ao carregar dados do usuário")) {
          navigate("/nao-autorizado");
        }
      }
    };

    loadUserDataAndSections();
  }, [instance, navigate]);

  const handleAddSection = () => {
    if (userRole !== "Administrador" && userRole !== "Administrador Geral") {
      setErrorMessage("Você não tem permissão para adicionar seções");
      return;
    }
    setIsAddingSection(true);
  };

  const handleSaveNewSection = async () => {
    if (userRole !== "Administrador" && userRole !== "Administrador Geral") {
      setErrorMessage("Você não tem permissão para adicionar seções");
      return;
    }

    if (newSectionTitle.trim() === "") {
      setErrorMessage("O título é obrigatório!");
      return;
    }

    try {
      const account = instance.getActiveAccount();
      if (!account) {
        throw new Error("Usuário não autenticado");
      }

      const tokenResponse = await instance.acquireTokenSilent({
        scopes: ["User.Read"],
        account,
      });

      const response = await fetch(`${API_BASE_URL}/politicas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenResponse.accessToken}`,
        },
        body: JSON.stringify({
          titulo: newSectionTitle.trim(),
          descricao: newSectionDescription.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Erro ao criar política");
      }

      const newSection = {
        id: data.politica._id,
        title: data.politica.titulo,
        description: data.politica.descricao,
      };

      setSections([...sections, newSection]);
      setSuccessMessage(data.message);
      setIsAddingSection(false);
      setNewSectionTitle("");
      setNewSectionDescription("");
      setActiveSection(newSection.id);
    } catch (error) {
      console.error("Erro ao criar seção:", error);
      setErrorMessage(error.message || "Erro ao criar seção");
    }
  };

  const handleDeleteSection = (id) => {
    if (userRole !== "Administrador" && userRole !== "Administrador Geral") {
      setErrorMessage("Você não tem permissão para excluir seções");
      return;
    }
    setSectionToDelete(id);
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    if (userRole !== "Administrador" && userRole !== "Administrador Geral") {
      setErrorMessage("Você não tem permissão para excluir seções");
      return;
    }

    try {
      const account = instance.getActiveAccount();
      if (!account) {
        throw new Error("Usuário não autenticado");
      }

      const tokenResponse = await instance.acquireTokenSilent({
        scopes: ["User.Read"],
        account,
      });

      const response = await fetch(`${API_BASE_URL}/politicas/${sectionToDelete}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${tokenResponse.accessToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Erro ao excluir política");
      }

      const updatedSections = sections.filter(
        (section) => section.id !== sectionToDelete
      );
      setSections(updatedSections);

      if (sectionToDelete === activeSection && updatedSections.length > 0) {
        setActiveSection(updatedSections[0].id);
      } else if (updatedSections.length === 0) {
        setActiveSection("");
      }

      setSuccessMessage(data.message);
      setShowConfirmModal(false);
      setSectionToDelete(null);
    } catch (error) {
      console.error("Erro ao excluir seção:", error);
      setErrorMessage(error.message || "Erro ao excluir seção");
      setShowConfirmModal(false);
      setSectionToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowConfirmModal(false);
    setSectionToDelete(null);
  };

  const handleEditSection = async (id, newTitle) => {
    if (userRole !== "Administrador" && userRole !== "Administrador Geral") {
      setErrorMessage("Você não tem permissão para editar seções");
      return;
    }

    const currentSection = sections.find((s) => s.id === id);
    if (currentSection.title === newTitle) {
      return;
    }

    try {
      const account = instance.getActiveAccount();
      if (!account) {
        throw new Error("Usuário não autenticado");
      }

      const tokenResponse = await instance.acquireTokenSilent({
        scopes: ["User.Read"],
        account,
      });

      const response = await fetch(`${API_BASE_URL}/politicas/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenResponse.accessToken}`,
        },
        body: JSON.stringify({
          titulo: newTitle.trim(),
          descricao: currentSection.description,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Erro ao atualizar política");
      }

      const updatedSections = sections.map((section) => {
        if (section.id === id) {
          return {
            ...section,
            title: data.politica.titulo,
            description: data.politica.descricao,
          };
        }
        return section;
      });

      setSections(updatedSections);
      setSuccessMessage(data.message);
    } catch (error) {
      console.error("Erro ao editar seção:", error);
      setErrorMessage(error.message || "Erro ao editar seção");
    }
  };

  const handleCancelAdd = () => {
    setIsAddingSection(false);
    setNewSectionTitle("");
    setNewSectionDescription("");
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
      {successMessage && (
          <AlertaOk mensagem={successMessage} />
        
      )}
      {errorMessage && (
          <AlertaErro mensagem={errorMessage} />
      )}
      <div className="bg-[#010409] h-[104px]"></div>

      <PageBanner pageName="Políticas e Termos" />

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
              newSectionDescription={newSectionDescription}
              setNewSectionDescription={setNewSectionDescription}
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
                description={section.description}
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
import { useState } from "react";
import PropTypes from "prop-types";
import EditarBtn from "../EditarBtn";
import AddBtn from "./AddBtn";
import DeletarBtn from "../DeletarBtn";

const Menu = ({
  sections,
  activeSection,
  setActiveSection,
  onDelete,
  onEdit,
  onAddClick,
  isAddingSection,
  newSectionTitle,
  setNewSectionTitle,
  newSectionDescription,
  setNewSectionDescription,
  onSaveNewSection,
  onCancelAdd,
  setSuccessMessage,
  setErrorMessage,
  isAdminMode,
}) => {
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");

  const handleStartEditing = (section) => {
    if (!isAdminMode) {
      setErrorMessage("Você não tem permissão para editar seções");
      return;
    }
    setEditingId(section.id);
    setEditTitle(section.title);
  };

  const handleSaveEdit = (id) => {
    if (!isAdminMode) {
      setErrorMessage("Você não tem permissão para editar seções");
      return;
    }
    if (editTitle.trim() === "") {
      setErrorMessage("Digite um título para a seção");
      return;
    }
    onEdit(id, editTitle);
    setEditingId(null);
    setEditTitle("");
    setSuccessMessage("Seção atualizada com sucesso!");
  };

  return (
    <div className="bg-[#0D1117] rounded-lg shadow-lg mb-10 mt-2">
      <ul className="space-y-2">
        {sections.map((section) => (
          <li key={section.id} className="border-b border-[#3D444D] pb-2">
            {editingId === section.id ? (
              <div className="flex items-center">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="flex-grow p-2 bg-gray-800 text-white border border-gray-700 rounded"
                />
                <button
                  onClick={() => handleSaveEdit(section.id)}
                  className="ml-2 px-3 py-1 bg-[#00BCFF] text-white rounded hover:bg-[#00BCFF]"
                >
                  OK
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="ml-2 px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-800"
                >
                  X
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setActiveSection(section.id)}
                  className={`text-left flex-grow py-2 px-3 rounded-md transition-colors ${
                    activeSection === section.id
                      ? "bg-blue-700 text-white"
                      : "text-gray-300 hover:bg-gray-800"
                  }`}
                >
                  {section.title}
                  <span className="ml-2"></span>
                </button>
                {isAdminMode && (
                  <div className="flex space-x-5">
                    <div></div>
                    <EditarBtn
                      onClick={() => handleStartEditing(section)}
                      isEditing={false}
                    />
                    <button onClick={() => onDelete(section.id)}>
                      <DeletarBtn />
                    </button>
                  </div>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>

      {isAdminMode && !isAddingSection ? (
        <div className="mt-4">
          <AddBtn
            onClick={onAddClick}
            buttonText="Adicionar Novo"
            width="100%"
            height="auto"
          />
        </div>
      ) : (
        isAdminMode && (
          <div className="mt-4 bg-gray-900 p-4 rounded-lg border border-gray-700">
            <h3 className="text-white mb-3">Nova Seção</h3>
            <input
              type="text"
              placeholder="Título da Seção"
              value={newSectionTitle}
              onChange={(e) => setNewSectionTitle(e.target.value)}
              className="w-full p-2 mb-4 bg-gray-800 text-white border border-gray-700 rounded"
            />
            
            <div className="flex justify-between">
              <button
                onClick={onSaveNewSection}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 hover:cursor-pointer"
              >
                Salvar
              </button>
              <button
                onClick={onCancelAdd}
                className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800 hover:cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>
        )
      )}
    </div>
  );
};

Menu.propTypes = {
  sections: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      description: PropTypes.string,
    })
  ).isRequired,
  activeSection: PropTypes.string.isRequired,
  setActiveSection: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onAddClick: PropTypes.func.isRequired,
  isAddingSection: PropTypes.bool.isRequired,
  newSectionTitle: PropTypes.string.isRequired,
  setNewSectionTitle: PropTypes.func.isRequired,
  onSaveNewSection: PropTypes.func.isRequired,
  onCancelAdd: PropTypes.func.isRequired,
  setSuccessMessage: PropTypes.func.isRequired,
  setErrorMessage: PropTypes.func.isRequired,
  isAdminMode: PropTypes.bool.isRequired,
};

export default Menu;
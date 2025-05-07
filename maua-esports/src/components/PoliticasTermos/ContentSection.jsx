import { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const ContentSection = ({ id, title, isActive }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState('');
  const [editorContent, setEditorContent] = useState('');

  // Carrega o conteúdo do localStorage quando o componente é montado
  useEffect(() => {
    const savedContent = localStorage.getItem(`termos-politicas-${id}`);
    if (savedContent) {
      setContent(savedContent);
      setEditorContent(savedContent);
    }
  }, [id]);

  // Adiciona CSS personalizado quando o componente é montado
  useEffect(() => {
    // Adiciona estilo personalizado ao editor
    const style = document.createElement('style');
    style.innerHTML = `
      .quill-editor-container .ql-editor {
        background-color: #0D111;
        color: white;
      }
      
      /* Adicionar títulos aos botões da barra de ferramentas */
      .ql-bold:hover::before { content: "Negrito"; position: absolute; background: #333; color: #fff; padding: 2px 5px; border-radius: 3px; font-size: 12px; bottom: 100%; left: 50%; transform: translateX(-50%); white-space: nowrap; }
      .ql-italic:hover::before { content: "Itálico"; position: absolute; background: #333; color: #fff; padding: 2px 5px; border-radius: 3px; font-size: 12px; bottom: 100%; left: 50%; transform: translateX(-50%); white-space: nowrap; }
      .ql-underline:hover::before { content: "Sublinhado"; position: absolute; background: #333; color: #fff; padding: 2px 5px; border-radius: 3px; font-size: 12px; bottom: 100%; left: 50%; transform: translateX(-50%); white-space: nowrap; }
      .ql-strike:hover::before { content: "Tachado"; position: absolute; background: #333; color: #fff; padding: 2px 5px; border-radius: 3px; font-size: 12px; bottom: 100%; left: 50%; transform: translateX(-50%); white-space: nowrap; }
      .ql-link:hover::before { content: "Inserir link"; position: absolute; background: #333; color: #fff; padding: 2px 5px; border-radius: 3px; font-size: 12px; bottom: 100%; left: 50%; transform: translateX(-50%); white-space: nowrap; }
      .ql-color:hover::before { content: "Cor do texto"; position: absolute; background: #333; color: #fff; padding: 2px 5px; border-radius: 3px; font-size: 12px; bottom: 100%; left: 50%; transform: translateX(-50%); white-space: nowrap; }
      .ql-background:hover::before { content: "Cor de fundo"; position: absolute; background: #333; color: #fff; padding: 2px 5px; border-radius: 3px; font-size: 12px; bottom: 100%; left: 50%; transform: translateX(-50%); white-space: nowrap; }
      .ql-clean:hover::before { content: "Limpar formatação"; position: absolute; background: #333; color: #fff; padding: 2px 5px; border-radius: 3px; font-size: 12px; bottom: 100%; left: 50%; transform: translateX(-50%); white-space: nowrap; }
      
      /* Garantir que a barra de ferramentas tenha posição relativa para os tooltips funcionarem */
      .ql-toolbar .ql-formats button {
        position: relative;
      }
    `;
    document.head.appendChild(style);

    // Limpa o estilo ao desmontar o componente
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    localStorage.setItem(`termos-politicas-${id}`, editorContent);
    setContent(editorContent);
    setIsEditing(false);
    alert('Conteúdo salvo com sucesso!');
  };

  const handleCancel = () => {
    const savedContent = localStorage.getItem(`termos-politicas-${id}`);
    if (savedContent) {
      setEditorContent(savedContent);
    }
    setIsEditing(false);
  };

  // Configuração do editor Quill - Mantido apenas o link (removida a citação)
  const modules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['link'],  // Apenas o link
      [{ 'color': [] }, { 'background': [] }],
      ['clean']
    ],
  };

  const formats = [
    'bold', 'italic', 'underline', 'strike',
    'link',  // Removido blockquote
    'color', 'background'
  ];

  return (
    <div className={`${isActive ? 'block' : 'hidden'}`}>
      <div className="flex justify-between items-start md:items-center border-b-2 border-[#3D444D] pb-3 mb-3">
        <h2 className="text-2xl font-bold text-[#F0F6FC]">{title}</h2>
        
        {!isEditing ? (
          <button 
            onClick={handleEdit}
            className="bg-[#284880] text-white border-0 py-2 px-4 rounded text-sm transition-colors hover:bg-[#162b50] mt-2"
          >
            Editar
          </button>
        ) : (
          <div className="flex mt-2 md:mt-0">
            <button 
              onClick={handleSave}
              className="bg-[#006400] text-white border-0 py-2 px-4 rounded text-sm transition-colors hover:bg-[#008800] mr-2"
            >
              Salvar
            </button>
            <button 
              onClick={handleCancel}
              className="bg-[#640000] text-white border-0 py-2 px-4 rounded text-sm transition-colors hover:bg-[#880000]"
            >
              Cancelar
            </button>
          </div>
        )}
      </div>
      
      {!isEditing ? (
        <div 
          className="min-h-[100px] text-[#8D8D99] mb-10"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      ) : (
        <div className="quill-editor-container mb-4">
          <ReactQuill
            theme="snow"
            value={editorContent}
            onChange={setEditorContent}
            modules={modules}
            formats={formats}
            className="rounded min-h-[300px]"
          />
        </div>
      )}
    </div>
  );
};

export default ContentSection;
import { useState, useEffect } from "react";
import { useMsal } from "@azure/msal-react";
import PropTypes from "prop-types";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const API_BASE_URL = "http://localhost:3000";

const ContentSection = ({
  id,
  title,
  description,
  isActive,
  setSuccessMessage,
  setErrorMessage,
  isAdminMode,
}) => {
  const { instance } = useMsal();
  const [isEditing, setIsEditing] = useState(false);
  const [isMarkdownMode, setIsMarkdownMode] = useState(false);
  const [content, setContent] = useState(description || "");
  const [editorContent, setEditorContent] = useState(description || "");
  const [markdownContent, setMarkdownContent] = useState("");

  useEffect(() => {
    const basicMarkdown = htmlToBasicMarkdown(description || "");
    setContent(description || "");
    setEditorContent(description || "");
    setMarkdownContent(basicMarkdown);
  }, [description]);

  const htmlToBasicMarkdown = (html) => {
    let markdown = html;
    markdown = markdown.replace(/<div>(.*?)<\/div>/gi, "$1\n");
    markdown = markdown.replace(/<h1>(.*?)<\/h1>/gi, "# $1\n");
    markdown = markdown.replace(/<h2>(.*?)<\/h2>/gi, "## $1\n");
    markdown = markdown.replace(/<h3>(.*?)<\/h3>/gi, "### $1\n");
    markdown = markdown.replace(/<strong>(.*?)<\/strong>/gi, "**$1**");
    markdown = markdown.replace(/<b>(.*?)<\/b>/gi, "**$1**");
    markdown = markdown.replace(/<em>(.*?)<\/em>/gi, "*$1*");
    markdown = markdown.replace(/<i>(.*?)<\/i>/gi, "*$1*");
    markdown = markdown.replace(/<u>(.*?)<\/u>/gi, "<u>$1</u>");
    markdown = markdown.replace(/<s>(.*?)<\/s>/gi, "~~$1~~");
    markdown = markdown.replace(/<strike>(.*?)<\/strike>/gi, "~~$1~~");
    markdown = markdown.replace(/<a href="(.*?)">(.*?)<\/a>/gi, "[$2]($1)");
    markdown = markdown.replace(/<p>(.*?)<\/p>/gi, "$1\n\n");
    return markdown.trim();
  };

  const markdownToHtml = (markdown) => {
    let html = markdown;
    html = html.replace(/^# (.*?)$/gm, "<h1>$1</h1>");
    html = html.replace(/^## (.*?)$/gm, "<h2>$1</h2>");
    html = html.replace(/^### (.*?)$/gm, "<h3>$1</h3>");
    html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");
    html = html.replace(/~~(.*?)~~/g, "<s>$1</s>");
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');
    html = html.replace(/\n\n/g, "</p><p>");
    html = "<p>" + html + "</p>";
    html = html.replace(/<p><\/p>/g, "<p><br></p>");
    return html;
  };

  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      .quill-editor-container .ql-editor {
        background-color: #0D1117;
        color: white;
      }
      .ql-bold:hover::before { content: "Negrito"; position: absolute; background: #333; color: #fff; padding: 2px 5px; border-radius: 3px; font-size: 12px; bottom: 100%; left: 50%; transform: translateX(-50%); white-space: nowrap; }
      .ql-italic:hover::before { content: "Itálico"; position: absolute; background: #333; color: #fff; padding: 2px 5px; border-radius: 3px; font-size: 12px; bottom: 100%; left: 50%; transform: translateX(-50%); white-space: nowrap; }
      .ql-underline:hover::before { content: "Sublinhado"; position: absolute; background: #333; color: #fff; padding: 2px 5px; border-radius: 3px; font-size: 12px; bottom: 100%; left: 50%; transform: translateX(-50%); white-space: nowrap; }
      .ql-strike:hover::before { content: "Tachado"; position: absolute; background: #333; color: #fff; padding: 2px 5px; border-radius: 3px; font-size: 12px; bottom: 100%; left: 50%; transform: translateX(-50%); white-space: nowrap; }
      .ql-link:hover::before { content: "Inserir link"; position: absolute; background: #333; color: #fff; padding: 2px 5px; border-radius: 3px; font-size: 12px; bottom: 100%; left: 50%; transform: translateX(-50%); white-space: nowrap; }
      .ql-color:hover::before { content: "Cor do texto"; position: absolute; background: #333; color: #fff; padding: 2px 5px; border-radius: 3px; font-size: 12px; bottom: 100%; left: 50%; transform: translateX(-50%); white-space: nowrap; }
      .ql-background:hover::before { content: "Cor de fundo"; position: absolute; background: #333; color: #fff; padding: 2px 5px; border-radius: 3px; font-size: 12px; bottom: 100%; left: 50%; transform: translateX(-50%); white-space: nowrap; }
      .ql-clean:hover::before { content: "Limpar formatação"; position: absolute; background: #333; color: #fff; padding: 2px 5px; border-radius: 3px; font-size: 12px; bottom: 100%; left: 50%; transform: translateX(-50%); white-space: nowrap; }
      .ql-size:hover::before { content: "Tamanho da fonte"; position: absolute; background: #333; color: #fff; padding: 2px 5px; border-radius: 3px; font-size: 12px; bottom: 100%; left: 50%; transform: translateX(-50%); white-space: nowrap; }
      .ql-toolbar .ql-formats button,
      .ql-toolbar .ql-formats .ql-picker {
        position: relative;
      }
      .ql-snow .ql-picker.ql-size .ql-picker-label::before,
      .ql-snow .ql-picker.ql-size .ql-picker-item::before {
        content: attr(data-value);
      }
      .ql-snow .ql-picker.ql-size .ql-picker-item[data-value="small"]::before {
        content: "Pequeno";
        font-size: 0.75em;
      }
      .ql-snow .ql-picker.ql-size .ql-picker-item[data-value="normal"]::before {
        content: "Normal";
        font-size: 1em;
      }
      .ql-snow .ql-picker.ql-size .ql-picker-item[data-value="large"]::before {
        content: "Grande";
        font-size: 1.5em;
      }
      .ql-snow .ql-picker.ql-size .ql-picker-item[data-value="huge"]::before {
        content: "Muito grande";
        font-size: 2em;
      }
      .ql-editor .ql-size-small {
        font-size: 0.75em;
      }
      .ql-editor .ql-size-normal {
        font-size: 1em;
      }
      .ql-editor .ql-size-large {
        font-size: 1.5em;
      }
      .ql-editor .ql-size-huge {
        font-size: 2em;
      }
      .ql-size-small,
      p.ql-size-small,
      span.ql-size-small {
        font-size: 0.75em !important;
      }
      .ql-size-normal,
      p.ql-size-normal,
      span.ql-size-normal {
        font-size: 1em !important;
      }
      .ql-size-large,
      p.ql-size-large,
      span.ql-size-large {
        font-size: 1.5em !important;
      }
      .ql-size-huge,
      p.ql-size-huge,
      span.ql-size-huge {
        font-size: 2em !important;
      }
      .markdown-editor {
        background-color: #0D1117;
        color: white;
        border: 1px solid #3D444D;
        border-radius: 4px;
        min-height: 300px;
        padding: 10px;
        font-family: monospace;
        width: 100%;
        resize: vertical;
      }
      .editor-toggle-btn {
        background-color: #3D444D;
        color: white;
        border: none;
        padding: 5px 10px;
        margin-right: 5px;
        border-radius: 3px;
        cursor: pointer;
        transition: background-color 0.2s;
      }
      .editor-toggle-btn.active {
        background-color: #284880;
      }
      .editor-toggle-btn:hover {
        background-color: #4D5460;
      }
      .editor-toggle-btn.active:hover {
        background-color: #162b50;
      }
      .editor-toggle-container {
        margin-bottom: 10px;
        display: flex;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const handleEdit = () => {
    if (!isAdminMode) {
      setErrorMessage("Você não tem permissão para editar seções");
      return;
    }
    setIsEditing(true);
    setIsMarkdownMode(false);
  };

  const handleEditMarkdown = () => {
    if (!isAdminMode) {
      setErrorMessage("Você não tem permissão para editar seções");
      return;
    }
    setIsEditing(true);
    setIsMarkdownMode(true);
  };

  const handleSave = async () => {
    if (!isAdminMode) {
      setErrorMessage("Você não tem permissão para editar seções");
      return;
    }
    try {
      let finalContent;
      if (isMarkdownMode) {
        finalContent = markdownToHtml(markdownContent);
        setEditorContent(finalContent);
      } else {
        finalContent = editorContent;
        const basicMarkdown = htmlToBasicMarkdown(finalContent);
        setMarkdownContent(basicMarkdown);
      }
      if (!finalContent.trim()) {
        setErrorMessage("O conteúdo não pode estar vazio");
        return;
      }

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
          titulo: title,
          descricao: finalContent,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Erro ao salvar política");
      }

      setContent(finalContent);
      setIsEditing(false);
      setSuccessMessage(data.message);
    } catch (err) {
      setErrorMessage(err.message || "Erro ao salvar o conteúdo");
      console.error("Erro ao salvar:", err);
    }
  };

  const handleCancel = () => {
    setEditorContent(content);
    setMarkdownContent(htmlToBasicMarkdown(content));
    setIsEditing(false);
  };

  const toggleEditorMode = (mode) => {
    if (mode === "markdown" && !isMarkdownMode) {
      const basicMarkdown = htmlToBasicMarkdown(editorContent);
      setMarkdownContent(basicMarkdown);
      setIsMarkdownMode(true);
    } else if (mode === "visual" && isMarkdownMode) {
      const html = markdownToHtml(markdownContent);
      setEditorContent(html);
      setIsMarkdownMode(false);
    }
  };

  const modules = {
    toolbar: [
      [{ size: ["small", "normal", "large", "huge"] }],
      ["bold", "italic", "underline", "strike"],
      ["link"],
      [{ color: [] }, { background: [] }],
      ["clean"],
    ],
  };

  const formats = [
    "bold",
    "italic",
    "underline",
    "strike",
    "size",
    "link",
    "color",
    "background",
  ];

  return (
    <div className={`${isActive ? "block" : "hidden"}`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b-2 border-[#3D444D] pb-3 mb-3">
  <h2 className="text-2xl font-bold text-[#F0F6FC] text-center sm:text-left"> {title} </h2>
  {isAdminMode && !isEditing ? (
    <div className="flex flex-col sm:flex-row gap-2 justify-center sm:justify-end">
      <button
        onClick={handleEdit}
        className="bg-[#284880] text-white border-0 py-2 px-4 rounded text-sm transition-colors hover:bg-[#162b50] hover:cursor-pointer w-full sm:w-auto"
      >
        Editar Visual
      </button>
      <button
        onClick={handleEditMarkdown}
        className="bg-[#284880] text-white border-0 py-2 px-4 rounded text-sm transition-colors hover:bg-[#162b50] hover:cursor-pointer w-full sm:w-auto"
      >
        Editar Markdown
      </button>
    </div>
  ) : (
    isAdminMode && (
      <div className="flex flex-col sm:flex-row gap-2 justify-center sm:justify-end">
        <button
          onClick={handleSave}
          className="bg-[#006400] text-white border-0 py-2 px-4 rounded text-sm transition-colors hover:bg-[#008800] hover:cursor-pointer w-full sm:w-auto"
        >
          Salvar
        </button>
        <button
          onClick={handleCancel}
          className="bg-[#640000] text-white border-0 py-2 px-4 rounded text-sm transition-colors hover:bg-[#880000] hover:cursor-pointer w-full sm:w-auto"
        >
          Cancelar
        </button>
      </div>
    )
  )}
</div>
      {!isEditing ? (
        <div
          className="min-h-[100px] text-[#8D8D99] mb-10"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      ) : (
        <div className="mb-4">
          <div className="editor-toggle-container">
            <button
              className={`editor-toggle-btn ${!isMarkdownMode ? "active" : ""}`}
              onClick={() => toggleEditorMode("visual")}
            >
              Editor Visual
            </button>
            <button
              className={`editor-toggle-btn ${isMarkdownMode ? "active" : ""}`}
              onClick={() => toggleEditorMode("markdown")}
            >
              Editor Markdown
            </button>
          </div>
          {!isMarkdownMode ? (
            <div className="quill-editor-container">
              <ReactQuill
                theme="snow"
                value={editorContent}
                onChange={setEditorContent}
                modules={modules}
                formats={formats}
                className="rounded min-h-[300px]"
              />
            </div>
          ) : (
            <div>
              <textarea
                className="markdown-editor"
                value={markdownContent}
                onChange={(e) => setMarkdownContent(e.target.value)}
                placeholder="Insira conteúdo usando markdown:
# Título 1
## Título 2
### Título 3

**negrito**
*itálico*
<u>sublinhado</u>
~~riscado~~
[link](https://url)
<span style='color:#Ff0000'>Texto colorido</span>
<span style='background-color:#Ffff00'>Texto com fundo</span>"
              />
              <div className="text-sm text-gray-400 mt-2">
                <p>Guia rápido de markdown:</p>
                <p># Título 1, ## Título 2, ### Título 3</p>
                <p>
                  **negrito**, *itálico*,{" "}
                  <span className="code-highlight">{"<u>sublinhado</u>"}</span>,{" "}
                  ~~riscado~~
                </p>
                <p>[texto do link](URL)</p>
                <p>
                  <span className="code-highlight">
                    {'<span style="color:#Ff0000">Texto vermelho</span>'}
                  </span>
                </p>
                <p>
                  <span className="code-highlight">
                    {
                      '<span style="background-color:#Ffff00">Fundo amarelo</span>'
                    }
                  </span>
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

ContentSection.propTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  isActive: PropTypes.bool.isRequired,
  setSuccessMessage: PropTypes.func.isRequired,
  setErrorMessage: PropTypes.func.isRequired,
  isAdminMode: PropTypes.bool.isRequired,
};

export default ContentSection;
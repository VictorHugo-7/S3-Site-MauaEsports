import { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const ContentSection = ({ id, title, isActive }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isMarkdownMode, setIsMarkdownMode] = useState(false);
  const [content, setContent] = useState('');
  const [editorContent, setEditorContent] = useState('');
  const [markdownContent, setMarkdownContent] = useState('');

  // Carrega o conteúdo do localStorage quando o componente é montado
  useEffect(() => {
    const savedContent = localStorage.getItem(`termos-politicas-${id}`);
    if (savedContent) {
      setContent(savedContent);
      setEditorContent(savedContent);
      // Tentativa básica de converter HTML para markdown para inicializar o editor markdown
      // Em uma implementação real, seria melhor usar uma biblioteca de conversão HTML -> Markdown
      const basicMarkdown = htmlToBasicMarkdown(savedContent);
      setMarkdownContent(basicMarkdown);
    }
  }, [id]);

  // Função simples para converter HTML em markdown básico
  const htmlToBasicMarkdown = (html) => {
    // Esta é uma conversão muito básica e não cobre todos os casos
    let markdown = html;
    
    // Removendo tags de div, mantendo conteúdo
    markdown = markdown.replace(/<div>(.*?)<\/div>/gi, '$1\n');
    
    // Convertendo cabeçalhos
    markdown = markdown.replace(/<h1>(.*?)<\/h1>/gi, '# $1\n');
    markdown = markdown.replace(/<h2>(.*?)<\/h2>/gi, '## $1\n');
    markdown = markdown.replace(/<h3>(.*?)<\/h3>/gi, '### $1\n');
    
    // Convertendo formatação de texto
    markdown = markdown.replace(/<strong>(.*?)<\/strong>/gi, '**$1**');
    markdown = markdown.replace(/<b>(.*?)<\/b>/gi, '**$1**');
    markdown = markdown.replace(/<em>(.*?)<\/em>/gi, '*$1*');
    markdown = markdown.replace(/<i>(.*?)<\/i>/gi, '*$1*');
    markdown = markdown.replace(/<u>(.*?)<\/u>/gi, '<u>$1</u>');
    markdown = markdown.replace(/<s>(.*?)<\/s>/gi, '~~$1~~');
    markdown = markdown.replace(/<strike>(.*?)<\/strike>/gi, '~~$1~~');
    
    // Convertendo links
    markdown = markdown.replace(/<a href="(.*?)">(.*?)<\/a>/gi, '[$2]($1)');
    
    // Parágrafos
    markdown = markdown.replace(/<p>(.*?)<\/p>/gi, '$1\n\n');
    
    // Mantém spans de cores como HTML
    // Não alteramos spans de cores, pois markdown puro não suporta cores
    
    return markdown.trim();
  };

  // Função para converter markdown básico em HTML
  const markdownToHtml = (markdown) => {
    // Esta é uma conversão muito básica e não cobre todos os casos
    let html = markdown;
    
    // Convertendo cabeçalhos
    html = html.replace(/^# (.*?)$/gm, '<h1>$1</h1>');
    html = html.replace(/^## (.*?)$/gm, '<h2>$1</h2>');
    html = html.replace(/^### (.*?)$/gm, '<h3>$1</h3>');
    
    // Convertendo formatação de texto
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    html = html.replace(/~~(.*?)~~/g, '<s>$1</s>');
    
    // Convertendo links
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');
    
    // Parágrafos - linhas vazias são convertidas em quebras de parágrafo
    html = html.replace(/\n\n/g, '</p><p>');
    html = '<p>' + html + '</p>';
    html = html.replace(/<p><\/p>/g, '<p><br></p>');
    
    return html;
  };

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
      
      /* Tooltip para o controle de tamanho de fonte */
      .ql-size:hover::before { content: "Tamanho da fonte"; position: absolute; background: #333; color: #fff; padding: 2px 5px; border-radius: 3px; font-size: 12px; bottom: 100%; left: 50%; transform: translateX(-50%); white-space: nowrap; }
      
      /* Garantir que a barra de ferramentas tenha posição relativa para os tooltips funcionarem */
      .ql-toolbar .ql-formats button,
      .ql-toolbar .ql-formats .ql-picker {
        position: relative;
      }
      
      /* Customizar a aparência do seletor de tamanho de fonte */
      .ql-snow .ql-picker.ql-size .ql-picker-label::before,
      .ql-snow .ql-picker.ql-size .ql-picker-item::before {
        content: attr(data-value);
      }
      
      /* Estilizar os itens de tamanho da fonte no menu suspenso */
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
      
      /* Definir os tamanhos reais dos textos no editor */
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
      
      /* Aplicar os tamanhos da fonte ao conteúdo visualizado (não editável) */
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
      
      /* Estilo para o editor de markdown */
      .markdown-editor {
        background-color: #0D111;
        color: white;
        border: 1px solid #3D444D;
        border-radius: 4px;
        min-height: 300px;
        padding: 10px;
        font-family: monospace;
        width: 100%;
        resize: vertical;
      }
      
      /* Botões para alternar entre editores */
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
      
      /* Container para os botões de alternar editor */
      .editor-toggle-container {
        margin-bottom: 10px;
        display: flex;
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
    setIsMarkdownMode(false); // Começa no modo visual por padrão
  };

  const handleEditMarkdown = () => {
    setIsEditing(true);
    setIsMarkdownMode(true); // Começa no modo markdown
  };

  const handleSave = () => {
    let finalContent;
    
    if (isMarkdownMode) {
      finalContent = markdownToHtml(markdownContent);
      setEditorContent(finalContent); // Atualiza também o conteúdo do editor Quill
    } else {
      finalContent = editorContent;
      // Tenta converter para markdown (para manter sincronizado)
      const basicMarkdown = htmlToBasicMarkdown(finalContent);
      setMarkdownContent(basicMarkdown);
    }
    
    localStorage.setItem(`termos-politicas-${id}`, finalContent);
    setContent(finalContent);
    setIsEditing(false);
    alert('Conteúdo salvo com sucesso!');
  };

  const handleCancel = () => {
    const savedContent = localStorage.getItem(`termos-politicas-${id}`);
    if (savedContent) {
      setEditorContent(savedContent);
      const basicMarkdown = htmlToBasicMarkdown(savedContent);
      setMarkdownContent(basicMarkdown);
    }
    setIsEditing(false);
  };

  const toggleEditorMode = (mode) => {
    if (mode === 'markdown' && !isMarkdownMode) {
      // Convertendo de Quill para Markdown
      const basicMarkdown = htmlToBasicMarkdown(editorContent);
      setMarkdownContent(basicMarkdown);
      setIsMarkdownMode(true);
    } else if (mode === 'visual' && isMarkdownMode) {
      // Convertendo de Markdown para Quill
      const html = markdownToHtml(markdownContent);
      setEditorContent(html);
      setIsMarkdownMode(false);
    }
  };

  // Configuração do editor Quill - Controle de tamanho de fonte em primeiro lugar
  const modules = {
    toolbar: [
      [{ 'size': ['small', 'normal', 'large', 'huge'] }],  // Tamanhos de fonte: pequeno, normal, grande e muito grande (agora em primeiro)
      ['bold', 'italic', 'underline', 'strike'],
      ['link'],
      [{ 'color': [] }, { 'background': [] }],
      ['clean']
    ],
  };

  const formats = [
    'bold', 'italic', 'underline', 'strike',
    'size',  // Adicionado formato de tamanho
    'link',
    'color', 'background'
  ];

  return (
    <div className={`${isActive ? 'block' : 'hidden'}`}>
      <div className="flex justify-between items-start md:items-center border-b-2 border-[#3D444D] pb-3 mb-3">
        <h2 className="text-2xl font-bold text-[#F0F6FC]">{title}</h2>
        
        {!isEditing ? (
          <div className="flex mt-2 md:mt-0">
            <button 
              onClick={handleEdit}
              className="bg-[#284880] text-white border-0 py-2 px-4 rounded text-sm transition-colors hover:bg-[#162b50] mr-2"
            >
              Editar Visual
            </button>
            <button 
              onClick={handleEditMarkdown}
              className="bg-[#284880] text-white border-0 py-2 px-4 rounded text-sm transition-colors hover:bg-[#162b50]"
            >
              Editar Markdown
            </button>
          </div>
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
        <div className="mb-4">
          {/* Botões para alternar entre os modos de edição */}
          <div className="editor-toggle-container">
            <button 
              className={`editor-toggle-btn ${!isMarkdownMode ? 'active' : ''}`}
              onClick={() => toggleEditorMode('visual')}
            >
              Editor Visual
            </button>
            <button 
              className={`editor-toggle-btn ${isMarkdownMode ? 'active' : ''}`}
              onClick={() => toggleEditorMode('markdown')}
            >
              Editor Markdown
            </button>
          </div>
          
          {/* Editor visual (Quill) */}
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
            /* Editor de Markdown */
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
                <p>**negrito**, *itálico*, <span className="code-highlight">{'<u>sublinhado</u>'}</span>, ~~riscado~~</p>
                <p>[texto do link](URL)</p>
                <p><span className="code-highlight">{'<span style="color:#Ff0000">Texto vermelho</span>'}</span></p>
                <p><span className="code-highlight">{'<span style="background-color:#Ffff00">Fundo amarelo</span>'}</span></p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ContentSection;
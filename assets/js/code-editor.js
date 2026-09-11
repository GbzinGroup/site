class CodeEditor{constructor(){this.currentTab="html",this.htmlCode="",this.cssCode="",this.jsCode="",this.isFullscreen=!1,this.autoUpdateEnabled=!0,this.updateTimer=null,this.init()}init(){this.loadDefaultCode(),this.setupEventListeners(),this.updateLineNumbers("html"),this.updateCursorPosition(),this.updateFileSize(),this.updatePreview()}loadDefaultCode(){this.htmlCode=`<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Meu Projeto</title>
</head>
<body>
    <div class="container">
        <h1>Bem-vindo ao Editor!</h1>
        <p>Edite o HTML, CSS e JavaScript separadamente</p>
        <button onclick="showMessage()">Clique Aqui</button>
        <p id="message"></p>
    </div>
</body>
</html>`,this.cssCode=`body {
    font-family: 'Segoe UI', sans-serif;
    margin: 0;
    padding: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
}

.container {
    text-align: center;
    background: white;
    padding: 40px;
    border-radius: 20px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    max-width: 400px;
}

h1 {
    color: #667eea;
    margin-bottom: 20px;
}

button {
    background: #667eea;
    color: white;
    border: none;
    padding: 15px 30px;
    border-radius: 10px;
    font-size: 16px;
    cursor: pointer;
    transition: all 0.3s;
    margin: 10px 0;
}

button:hover {
    background: #764ba2;
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(0,0,0,0.2);
}

#message {
    font-size: 18px;
    color: #667eea;
    margin-top: 10px;
}`,this.jsCode=`function showMessage() {
    document.getElementById('message').innerHTML = 
        '🎉 Você acabou de executar JavaScript!';
    document.getElementById('message').style.animation = 'fadeIn 0.5s';
}`,document.getElementById("htmlCode").value=this.htmlCode,document.getElementById("cssCode").value=this.cssCode,document.getElementById("jsCode").value=this.jsCode}setupEventListeners(){window.switchTab=e=>{this.currentTab=e,document.querySelectorAll(".editor-tab").forEach(t=>{t.classList.remove("active"),t.dataset.tab===e&&t.classList.add("active")});const t={html:"htmlEditor",css:"cssEditor",js:"jsEditor"};Object.keys(t).forEach(o=>{const n=document.getElementById(t[o]);o===e?n.classList.remove("hidden"):n.classList.add("hidden")});const o={html:"HTML",css:"CSS",js:"JavaScript"}[e],n=document.getElementById("currentLanguage");n&&(n.textContent=o),this.updateLineNumbers(e),this.updateCursorPosition()},window.runCode=()=>{this.updatePreview(),this.showToast("Código executado com sucesso!","success")},window.resetCode=()=>{confirm("Deseja resetar todo o código para o padrão?")&&(this.loadDefaultCode(),this.updateLineNumbers(this.currentTab),this.updateCursorPosition(),this.updateFileSize(),this.updatePreview(),this.showToast("Código resetado!","info"))},document.querySelectorAll(".code-input").forEach(e=>{e.addEventListener("input",()=>{this.updateLineNumbers(this.currentTab),this.updateCursorPosition(),this.updateFileSize(),this.autoUpdateEnabled&&(clearTimeout(this.updateTimer),this.updateTimer=setTimeout(()=>{this.updatePreview()},1e3),this.updatePreviewStatus("Atualizando..."))}),e.addEventListener("keyup",e=>{this.updateCursorPosition()}),e.addEventListener("click",()=>{this.updateCursorPosition()}),e.addEventListener("scroll",()=>{this.syncScroll(e)})}),document.addEventListener("keydown",e=>{(e.ctrlKey||e.metaKey)&&"Enter"===e.key&&(e.preventDefault(),this.updatePreview()),(e.ctrlKey||e.metaKey)&&"s"===e.key&&(e.preventDefault(),this.saveCode())});const e=document.getElementById("previewFrame");e&&e.addEventListener("load",()=>{this.autoUpdateEnabled&&this.updatePreviewStatus("Atualizado")})}handleTabKey(e,t){if("Tab"===e.key){e.preventDefault();const o=document.getElementById(t),n=o.selectionStart,s=o.selectionEnd,c="    ";o.value=o.value.substring(0,n)+c+o.value.substring(s),o.selectionStart=o.selectionEnd=n+c.length;const a=t.replace("Code","");this.updateLineNumbers(a),this.updateCursorPosition(),this.updateFileSize(),o.dispatchEvent(new Event("input"))}}updateLineNumbers(e){const t=document.getElementById(`${e}Code`),o=document.getElementById(`${e}LineNumbers`);if(!t||!o)return;const n=t.value.split("\n");let s="";for(let e=1;e<=n.length;e++)s+=e+"\n";o.textContent=s,this.syncScroll(t,o)}syncScroll(e,t){t&&(t.scrollTop=e.scrollTop)}updateCursorPosition(){const e=document.getElementById(`${this.currentTab}Code`),t=document.getElementById("cursorPosition");if(!e||!t)return;const o=e.value.substring(0,e.selectionStart).split("\n");t.textContent=`Ln ${o.length}, Col ${o[o.length-1].length+1}`}updateFileSize(){const e=document.getElementById(`${this.currentTab}Code`),t=document.getElementById("fileSize");if(!e||!t)return;const o=new Blob([e.value]).size;t.textContent=o<1024?`${o} B`:`${(o/1024).toFixed(1)} KB`}updatePreviewStatus(e){const t=document.getElementById("previewStatus");t&&(t.textContent=e,"Atualizado"===e?t.className="badge badge-success":"Atualizando..."===e?t.className="badge badge-warning":t.className="badge badge-info")}getCombinedCode(){const e=document.getElementById("htmlCode").value,t=document.getElementById("cssCode").value,o=document.getElementById("jsCode").value;let n=e;if(t.trim()){const e=`<style>\n${t}\n</style>`;n.includes("<style>")?n=n.replace(/<style>[\s\S]*?<\/style>/,e):n.includes("</head>")?n=n.replace("</head>",`${e}\n</head>`):n=`${e}\n${n}`}if(o.trim()){const e=`<script>\n${o}\n<\/script>`;n.includes("<script>")?n=n.replace(/<script>[\s\S]*?<\/script>/,e):n.includes("</body>")?n=n.replace("</body>",`${e}\n</body>`):n=`${n}\n${e}`}return n}updatePreview(){const e=document.getElementById("previewFrame"),t=this.getCombinedCode(),o=new Blob([t],{type:"text/html"}),n=URL.createObjectURL(o);e.src=n,setTimeout(()=>{URL.revokeObjectURL(n)},2e3),this.updatePreviewStatus("Atualizado")}openPreviewInNewTab(){const e=this.getCombinedCode(),t=new Blob([e],{type:"text/html"}),o=URL.createObjectURL(t);window.open(o,"_blank"),setTimeout(()=>{URL.revokeObjectURL(o)},2e3),this.showToast("Preview aberto em nova aba!","success")}toggleFullscreen(){const e=document.getElementById("previewFrame"),t=document.querySelector(".preview-actions .fa-expand, .preview-actions .fa-compress");if(this.isFullscreen=!this.isFullscreen,this.isFullscreen){e.classList.add("fullscreen"),t&&(t.className="fas fa-compress"),document.body.style.overflow="hidden";const o=document.createElement("button");o.className="fullscreen-close",o.innerHTML='<i class="fas fa-times"></i>',o.onclick=()=>this.toggleFullscreen(),e.parentElement.appendChild(o),this.showToast("Modo tela cheia ativado!","info")}else{e.classList.remove("fullscreen"),t&&(t.className="fas fa-expand"),document.body.style.overflow="";const o=document.querySelector(".fullscreen-close");o&&o.remove(),this.showToast("Modo tela cheia desativado!","info")}}saveCode(){const e={html:document.getElementById("htmlCode").value,css:document.getElementById("cssCode").value,js:document.getElementById("jsCode").value,savedAt:(new Date).toISOString()};localStorage.setItem("saved_code",JSON.stringify(e)),this.showToast("Código salvo com sucesso!","success")}loadSavedCode(){const e=localStorage.getItem("saved_code");if(e){const t=JSON.parse(e);return document.getElementById("htmlCode").value=t.html||"",document.getElementById("cssCode").value=t.css||"",document.getElementById("jsCode").value=t.js||"",this.updateLineNumbers(this.currentTab),this.updateCursorPosition(),this.updateFileSize(),this.updatePreview(),this.showToast("Código carregado!","success"),!0}return!1}showToast(e,t="success"){let o=document.querySelector(".toast-container");o||(o=document.createElement("div"),o.className="toast-container",document.body.appendChild(o));const n=document.createElement("div");n.className=`toast toast-${t}`;const s={success:"fa-check-circle",error:"fa-times-circle",warning:"fa-exclamation-triangle",info:"fa-info-circle"};n.innerHTML=`<i class="fas ${s[t]||s.info}"></i><span>${e}</span>`,o.appendChild(n),setTimeout(()=>{n.classList.add("show")},10),setTimeout(()=>{n.classList.remove("show"),setTimeout(()=>n.remove(),300)},3e3)}}function switchTab(e){window.codeEditor&&window.codeEditor.switchTab(e)}function runCode(){window.codeEditor&&window.codeEditor.updatePreview()}function resetCode(){window.codeEditor&&window.codeEditor.resetCode()}function openPreviewInNewTab(){window.codeEditor&&window.codeEditor.openPreviewInNewTab()}function toggleFullscreen(){window.codeEditor&&window.codeEditor.toggleFullscreen()}function updateLineNumbers(e){window.codeEditor&&(window.codeEditor.updateLineNumbers(e),window.codeEditor.updateCursorPosition(),window.codeEditor.updateFileSize())}function handleTabKey(e,t){window.codeEditor&&window.codeEditor.handleTabKey(e,t)}document.addEventListener("DOMContentLoaded",()=>{if(window.codeEditor=new CodeEditor,!document.querySelector("#toast-styles")){const e=document.createElement("style");e.id="toast-styles",e.textContent=`.toast-container{position:fixed;bottom:20px;right:20px;z-index:3000;display:flex;flex-direction:column;gap:10px}.toast{background:var(--bg-secondary);border:1px solid var(--border);border-radius:var(--radius-sm);padding:1rem 1.5rem;box-shadow:var(--shadow-lg);display:flex;align-items:center;gap:.75rem;transform:translateX(100%);opacity:0;transition:all .3s ease;min-width:250px}.toast.show{transform:translateX(0);opacity:1}.toast i{font-size:1.2rem}.toast-success i{color:var(--success)}.toast-error i{color:var(--danger)}.toast-warning i{color:var(--warning)}.toast-info i{color:var(--info)}.toast span{color:var(--text-primary);font-weight:500}.fullscreen-close{position:fixed;top:20px;right:20px;z-index:3001;width:40px;height:40px;border-radius:50%;background:var(--danger);color:#fff;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:1.2rem;box-shadow:var(--shadow-lg)}.fullscreen-close:hover{background:#c0392b}`,document.head.appendChild(e)}console.log("Editor de código carregado!"),console.log("Atalhos: Ctrl+Enter = Executar, Ctrl+S = Salvar")});
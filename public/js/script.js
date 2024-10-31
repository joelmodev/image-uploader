
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const fileList = document.getElementById('file-list');
const submitButton = document.getElementById('submit-button');
const uploadForm = document.getElementById('uploadForm');
const alert = document.getElementById('alert');
const fileLinkDiv = document.getElementById('fileLink');

let files = [];

dropZone.addEventListener('click', () => fileInput.click());

dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('drag-over');
});

dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('drag-over');
});

dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('drag-over');
  handleFiles(e.dataTransfer.files);
});

fileInput.addEventListener('change', (e) => {
  handleFiles(e.target.files);
});

function handleFiles(newFiles) {
  files = [...newFiles];
  updateFileList();
  updateSubmitButton();
}

function updateFileList() {
  fileList.innerHTML = '';
  files.forEach(file => {
    const li = document.createElement('li');
    li.className = 'file-item';
    li.innerHTML = `
      <svg class="file-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
        <polyline points="13 2 13 9 20 9"></polyline>
      </svg>
      ${file.name}
    `;
    fileList.appendChild(li);
  });
}

function updateSubmitButton() {
  submitButton.disabled = files.length === 0;
}

uploadForm.addEventListener('submit', function(event) {
  event.preventDefault();
  if (files.length === 0) return;

  submitButton.disabled = true;
  submitButton.textContent = 'Enviando...';
  alert.style.display = 'none';

  const formData = new FormData(uploadForm);
  const xhr = new XMLHttpRequest();

  xhr.open('POST', '/upload', true);

  xhr.onload = function() {
    submitButton.disabled = false;
    submitButton.textContent = 'Enviar Arquivos';

    if (xhr.status === 200) {
      const response = JSON.parse(xhr.responseText);
      fileLinkDiv.innerHTML = `<a href="/f/${response.id}" target="_blank">Clique aqui para acessar o arquivo</a>`;
      showAlert('success', 'Seus arquivos foram enviados com sucesso.');
      files = [];
      updateFileList();
      updateSubmitButton();
    } else {
      const response = JSON.parse(xhr.responseText);
      fileLinkDiv.innerHTML = '';
      showAlert('error', 'Ocorreu um erro ao enviar seus arquivos. Por favor, tente novamente.');
    }
  };

  xhr.send(formData);
});

function showAlert(type, message) {
  alert.className = `alert ${type === 'success' ? 'alert-success' : 'alert-error'}`;
  alert.innerHTML = `
    <svg class="alert-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      ${type === 'success' 
        ? '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>'
        : '<circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line>'}
    </svg>
    ${message}
  `;
  alert.style.display = 'flex';
}
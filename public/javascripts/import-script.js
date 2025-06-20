function showFormat() {
  const fileType = document.getElementById('fileType').value;
  document.getElementById('csvFormat').style.display = fileType === 'csv' ? 'block' : 'none';
  document.getElementById('jsonFormat').style.display = fileType === 'json' ? 'block' : 'none';
}

document.getElementById('importForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  setMessage('info', window.t ? t('importing_file') : 'Đang import file...');

  const formData = new FormData();
  formData.append('fileType', document.getElementById('fileType').value);
  formData.append('file', document.getElementById('file').files[0]);

  const response = await fetch('import', {
    method: 'POST',
    body: formData
  });
  
  const result = await response.json();
  if (response.ok && result.ok){
    setMessage('success', result.message || (window.t ? t('import_file_success') : 'Import file thành công'));
  } else {
    setMessage('error', result.message || result.error || (window.t ? t('import_file_failed') : 'Lỗi khi import file'));
  }
});

function setMessage(tag, msg){
  const messageDiv = document.getElementById('message');
  messageDiv.classList.remove('success');
  messageDiv.classList.remove('error');
  messageDiv.classList.remove('warning');
  messageDiv.classList.remove('info');
  messageDiv.classList.add(tag);
  messageDiv.style.display = 'block';
  messageDiv.textContent = msg;
}

// Show CSV format by default
showFormat();
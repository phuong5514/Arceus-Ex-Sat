function showFormat() {
  const fileType = document.getElementById('fileType').value;
  document.getElementById('csvFormat').style.display = fileType === 'csv' ? 'block' : 'none';
  document.getElementById('jsonFormat').style.display = fileType === 'json' ? 'block' : 'none';
}

document.getElementById('importForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  setMessage('info', 'Đang import file...');

  const formData = new FormData();
  formData.append('fileType', document.getElementById('fileType').value);
  formData.append('file', document.getElementById('file').files[0]);

  const response = await fetch('import', {
    method: 'POST',
    body: formData
  });
  
  const result = await response.json();
  if (response.ok) {
    const result = response.json();
    if (result.ok){
      setMessage('success', 'Import file thành công');
    } else {
      setMessage('error', 'Lỗi khi import file: ' + result.message);
    }
  } else {
    const error = response.json();
    setMessage('error', 'Lỗi khi import file: ' + error.message);
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
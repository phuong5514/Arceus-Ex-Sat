function showFormat() {
  const fileType = document.getElementById('fileType').value;
  document.getElementById('csvFormat').style.display = fileType === 'csv' ? 'block' : 'none';
  document.getElementById('jsonFormat').style.display = fileType === 'json' ? 'block' : 'none';
}

document.getElementById('importForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData();
  formData.append('fileType', document.getElementById('fileType').value);
  formData.append('file', document.getElementById('file').files[0]);

  try {
    const response = await fetch('/import', {
      method: 'POST',
      body: formData
    });
    const data = await response.json();

    const messageDiv = document.getElementById('message');
    messageDiv.textContent = data.message;
    messageDiv.className = data.success ? 'success' : 'error';
    messageDiv.style.display = 'block';

    if (data.success) {
      // Nếu import thành công, reset form sau 2 giây
      setTimeout(() => {
        document.getElementById('importForm').reset();
        messageDiv.style.display = 'none';
      }, 2000);
    }
  } catch (error) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = 'Error importing file: ' + error.message;
    messageDiv.className = 'error';
    messageDiv.style.display = 'block';
  }
});

// Show CSV format by default
showFormat();
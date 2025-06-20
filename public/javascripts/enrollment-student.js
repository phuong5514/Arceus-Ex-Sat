async function onRemoveClassesClick(){
  const classesToRemove = document.querySelectorAll(".remove-class-checkbox");
  const selectedClasses = [];
  for (let i = 0; i < classesToRemove.length; i++){
    if (classesToRemove[i].checked){
      selectedClasses.push(classesToRemove[i].value);
    }
  }

  if (selectedClasses.length === 0){
    setMessage('message-enrolled', 'warning', window.t ? t('select_at_least_one_class_to_remove') : 'Vui lòng chọn ít nhất một lớp học để xóa.');
    return;
  }

  const student_id = window.location.pathname.split('/').pop();

  setMessage('message-enrolled', 'info', window.t ? t('removing') : 'Đang xóa...');

  const response = await fetch(`enrollment/unregister/${student_id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(selectedClasses)
  });

  const result = await response.json();
  if (response.ok && result.ok){
    setMessage('message-enrolled', 'success', result.message || (window.t ? t('remove_class_success') : 'Xóa lớp học thành công.'));
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  } else {
    setMessage('message-enrolled', 'error', result.message || result.error || (window.t ? t('remove_class_failed') : 'Có lỗi xảy ra khi xóa lớp học.'));
  }
}

async function onAddClassesClick(){
  const classesToAdd = document.querySelectorAll(".add-class-checkbox");
  const selectedClasses = [];
  for (let i = 0; i < classesToAdd.length; i++){
    if (classesToAdd[i].checked){
      selectedClasses.push(classesToAdd[i].value);
    }
  }

  if (selectedClasses.length === 0){
    setMessage('message-available', 'warning', window.t ? t('select_at_least_one_class_to_add') : 'Vui lòng chọn ít nhất một lớp học để thêm.');
    return;
  }

  const student_id = window.location.pathname.split('/').pop();
  setMessage('message-available', 'info', window.t ? t('adding') : 'Đang thêm...');

  const response = await fetch(`enrollment/register/${student_id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(selectedClasses)
  });

  const result = await response.json();
  if (response.ok && result.ok){
    setMessage('message-available', 'success', result.message || (window.t ? t('add_class_success') : 'Thêm lớp học thành công.'));
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  } else {
    setMessage('message-available', 'error', result.message || result.error || (window.t ? t('add_class_failed') : 'Có lỗi xảy ra khi thêm lớp học.'));
  }
}

function setMessage(message_panel_id, tag, msg){
  const messageDiv = document.getElementById(message_panel_id);
  messageDiv.classList.remove('success', 'error', 'warning', 'info');
  messageDiv.classList.add(tag);
  messageDiv.style.display = 'block';
  messageDiv.textContent = msg;
}

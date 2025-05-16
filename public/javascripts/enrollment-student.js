import { response } from "express";

async function onRemoveClassesClick(){
  const classesToRemove = document.querySelectorAll(".remove-class-checkbox");
  const selectedClasses = [];
  for (let i = 0; i < classesToRemove.length; i++){
    if (classesToRemove[i].checked){
      selectedClasses.push(classesToRemove[i].value);
    }
  }

  if (selectedClasses.length === 0){
    setMessage('message-enrolled', 'warning', 'Vui lòng chọn ít nhất một lớp học để thêm.');
    return;
  }

  const student_id = window.location.pathname.split('/').pop();

  setMessage('message-enrolled', 'info', 'Đang xóa...');

  const response = await fetch(`/enrollment/unregister/${student_id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(selectedClasses)
  });

  if (response.ok){
    const result = await response.json();
    if (result.ok){
      setMessage('message-enrolled', 'success', 'Xóa lớp học thành công.');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } else {
      setMessage('message-enrolled', 'error', 'Có lỗi xảy ra khi thêm lớp học: ' + result.message);
    }
  } else {
    const error = await response.json();
    setMessage('message-enrolled', 'error', 'Có lỗi xảy ra khi thêm lớp học: ' + error.message);
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
    setMessage('message-available', 'warning', 'Vui lòng chọn ít nhất một lớp học để thêm.');
    return;
  }

  const student_id = window.location.pathname.split('/').pop();
  setMessage('message-available', 'info', 'Đang thêm...');

  const response = await fetch(`/enrollment/register/${student_id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(selectedClasses)
  });

  if (response.ok){
    const result = await response.json();
    if (result.ok){
      setMessage('message-available', 'success', 'Thêm lớp học thành công.');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } else {
      setMessage('message-available', 'error', 'Có lỗi xảy ra khi thêm lớp học: ' + result.message);
    }
  } else {
    const error = await response.json();
    setMessage('message-available', 'error', 'Có lỗi xảy ra khi thêm lớp học: ' + error.message);
  }
}

function setMessage(message_panel_id, tag, msg){
  const messageDiv = document.getElementById(message_panel_id);
  messageDiv.classList.remove('success', 'error', 'warning', 'info');
  messageDiv.classList.add(tag);
  messageDiv.style.display = 'block';
  messageDiv.textContent = msg;
}

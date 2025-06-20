async function onEditCourseSubmitted(event){
  event.preventDefault();
  const form = event.target;

  const course_name = form.querySelector("#course_name").value;
  const department = form.querySelector("#department").value;
  const credits = form.querySelector("#credits").value;
  const description = form.querySelector("#description").value;
  const prerequisite_course = form.querySelector("#prerequisite_course").value;
  const is_active = form.querySelector("#is_active").value == "true";
  
  const course = {
    course_name,
    department,
    credits,
    description,
    prerequisite_course,
    is_active
  }
  
  const courseId = window.location.pathname.split('/').pop();
  const response = await fetch(`course/${courseId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(course)
  });
  
  const result = await response.json();
  if (response.ok && result.ok){
    setMessage('success', result.message || (window.t ? t("update_course_success") : "Cập nhật khóa học thành công!"));
    setTimeout(() => {
      window.location.href = `course/${courseId}`;
    }, 1000);
  } else {
    setMessage('error', result.message || result.error || (window.t ? t("update_course_failed") : "Cập nhật khóa học thất bại!"));
  }
}

async function onDeleteCourseClicked(courseId){
  const response = await fetch(`course/${courseId}`, {
    method: 'DELETE'
  });
  
  const result = await response.json();
  if (response.ok && result.ok){
    setMessage('success', result.message || (window.t ? t("delete_course_success") : "Xóa khóa học thành công!"));
    setTimeout(() => {
      window.location.href = `course`;
    }, 1000);
  } else {
    setMessage('error', result.message || result.error || (window.t ? t("delete_course_failed") : "Xóa khóa học thất bại!"));
  }
}

function setMessage(tag, message){
  const messageDiv = document.getElementById('message');
  messageDiv.classList.remove('success', 'error', 'warning', 'info');
  messageDiv.classList.add(tag);
  messageDiv.style.display = 'block';
  messageDiv.textContent = message;
}
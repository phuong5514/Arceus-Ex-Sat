async function onAddCourseSubmitted(event){
  event.preventDefault();
  const form = event.target;

  const course_id = form.querySelector("#course_id").value;
  const course_name = form.querySelector("#course_name").value;
  const department = form.querySelector("#department").value;
  const credits = form.querySelector("#credits").value;
  const description = form.querySelector("#description").value;
  const prerequisite_course = form.querySelector("#prerequisite_course").value;
  const is_active = form.querySelector("#is_active").value == "true";
  
  const course = {
    _id : course_id,
    course_name,
    department,
    credits,
    description,
    prerequisite_course,
    is_active
  }
  
  const response = await fetch(`/course`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(course)
  });
  
  if (response.ok){
    const result = await response.json();
    if (result.ok){
      console.log("Cập nhật khóa học thành công!");
      setMessage('success', "Cập nhật khóa học thành công!");
      setTimeout(() => {
        window.location.href = `/course/${course_id}`;
      }, 1000);
    } else {
      console.error(result.message);
      setMessage('error', result.message);
    }
  } else {
    const error = await response.json();
    console.error(error.message);
    setMessage('error', error.message);
  }
}

function setMessage(tag, message){
  const messageDiv = document.getElementById('message');
  messageDiv.classList.remove('success', 'error', 'warning', 'info');
  messageDiv.classList.add(tag);
  messageDiv.style.display = 'block';
  messageDiv.textContent = message;
}
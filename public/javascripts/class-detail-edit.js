async function onClassSubmitted(event, mode) {
    if (mode) {
        onEditClassSubmitted(event);
    } else {
        onCreateClassSubmitted(event);
    }
}


async function onEditClassSubmitted(event) {
    event.preventDefault();
    const form = event.target;

    const course_id = form.querySelector("#course_id").value;
    const academic_year = form.querySelector("#academic_year").value;
    const semester = form.querySelector("#semester").value;
    const lecturer = form.querySelector("#lecturer").value;
    const max_students = form.querySelector("#max_students").value;
    const schedule = form.querySelector("#schedule").value;
    const classroom = form.querySelector("#classroom").value;

    const classData = {
        course_id,
        academic_year,
        semester,
        lecturer,
        max_students,
        schedule,
        classroom
    };

    const originalClassId = window.location.pathname.split('/').pop();
    const response = await fetch(`class/${originalClassId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(classData)
    });

    const result = await response.json();
    if (response.ok && result.ok) {
        setMessage('success', result.message || (window.t ? t("update_class_success") : "Cập nhật lớp học thành công!"));
        setTimeout(() => {
            window.location.href = `class/${originalClassId}`;
        }, 1000);
    } else {
        setMessage('error', result.message || result.error || (window.t ? t("update_class_failed") : "Cập nhật lớp học thất bại!"));
    }
}

async function onCreateClassSubmitted(event) {
    event.preventDefault();
    const form = event.target;

    const _id = form.querySelector("#id").value;
    const course_id = form.querySelector("#course_id").value;
    const academic_year = form.querySelector("#academic_year").value;
    const semester = form.querySelector("#semester").value;
    const lecturer = form.querySelector("#lecturer").value;
    const max_students = form.querySelector("#max_students").value;
    const schedule = form.querySelector("#schedule").value;
    const classroom = form.querySelector("#classroom").value;

    const classData = {
        _id,
        course_id,
        academic_year,
        semester,
        lecturer,
        max_students,
        schedule,
        classroom
    };

    const response = await fetch(`class`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(classData)
    });

    const result = await response.json();
    if (response.ok && result.ok) {
        setMessage('success', result.message || (window.t ? t("add_class_success") : "Thêm lớp học thành công!"));
        setTimeout(() => {
            window.location.href = `class`;
        }, 1000);
    } else {
        setMessage('error', result.message || result.error || (window.t ? t("add_class_failed") : "Thêm lớp học thất bại!"));
    }
}

async function onDeleteClassClicked(classId) {
    const response = await fetch(`class/${classId}`, {
        method: 'DELETE'
    });

    const result = await response.json();
    if (response.ok && result.ok) {
        setMessage('success', result.message || (window.t ? t("delete_class_success") : "Xóa lớp học thành công!"));
        setTimeout(() => {
            window.location.href = `class`;
        }, 1000);
    } else {
        setMessage('error', result.message || result.error || (window.t ? t("delete_class_failed") : "Xóa lớp học thất bại!"));
    }
}

function setMessage(tag, message){
    const messageDiv = document.getElementById('message');
    messageDiv.classList.remove('success', 'error', 'warning', 'info');
    messageDiv.classList.add(tag);
    messageDiv.style.display = 'block';
    messageDiv.textContent = message;
  }

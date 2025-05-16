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
    const response = await fetch(`/class/${originalClassId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(classData)
    });

    if (response.ok) {
        const result = await response.json();
        if (result.ok) {
            console.log("Cập nhật lớp học thành công!");
            setMessage('success', "Cập nhật lớp học thành công!");
            setTimeout(() => {
                window.location.href = `/class/${originalClassId}`;
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

    const response = await fetch(`/class`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(classData)
    });

    if (response.ok) {
        const result = await response.json();
        if (result.ok) {
            console.log("Thêm lớp học thành công!");
            setMessage('success', "Thêm lớp học thành công!");
            setTimeout(() => {
                window.location.href = `/class`;
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

async function onDeleteClassClicked(classId) {
    const response = await fetch(`/class/${classId}`, {
        method: 'DELETE'
    });

    if (response.ok) {
        const result = await response.json();
        if (result.ok) {
            console.log("Xóa lớp học thành công!");
            setMessage('success', "Xóa lớp học thành công!");
            setTimeout(() => {
                window.location.href = `/class`;
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

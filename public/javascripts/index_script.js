let mode = "view";
let dataChanged = false;
let selectedRow = null;

function onAddStudentClicked() {
    changeToMode("add");
}

function onEditStudentClicked() {
    changeToMode("edit");
}


function onStudentRowClick(row, studentId) {
    if (mode !== "edit") return;
    const checkbox = row.querySelector('.edit-checkbox');
    checkbox.checked = !checkbox.checked;
    
    onEditCheckboxChange(checkbox, studentId);
}

function onEditCheckboxChange(checkbox, studentId) {
    const row = checkbox.closest('tr');

    document.querySelectorAll('.edit-checkbox').forEach(cb => {
        if (cb !== checkbox) {
            cb.checked = false;
        }
    });

    if (selectedRow) {
        selectedRow.classList.remove('selected');
    }

    if (checkbox.checked) {
        row.classList.add('selected');
        selectedRow = row;
        selectedStudentId = studentId;

        const cells = row.getElementsByTagName("td");
        // first cell for marking
        
        document.getElementById("edit-student-id").value = cells[1].textContent.trim();
        document.getElementById("edit-name").value = cells[2].textContent.trim();
        
        const birthdate = cells[3].textContent.trim();
        if (birthdate && birthdate !== 'Invalid Date') {
            const [day, month, year] = birthdate.split('/');
            document.getElementById("edit-birthdate").value = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        } else {
            document.getElementById("edit-birthdate").value = '';
        }
        
        document.getElementById("edit-gender").value = cells[4].textContent.trim();
        document.getElementById("edit-major").value = cells[5].getAttribute("name");
        document.getElementById("edit-class_year").value = cells[6].textContent.trim();
        document.getElementById("edit-program").value = cells[7].getAttribute("name");
        document.getElementById("edit-address").value = cells[8].textContent.trim();
        document.getElementById("edit-email").value = cells[9].textContent.trim();
        document.getElementById("edit-phone_number").value = cells[10].textContent.trim();
        document.getElementById("edit-status").value = cells[11].getAttribute("name");;

        setMessage("info", "Đang chỉnh sửa thông tin sinh viên: " + studentId);
    } else {
        selectedRow = null;
        selectedStudentId = null;
        setMessage("", "");
        
        document.getElementById("edit-student-id").value = "";
        document.getElementById("edit-name").value = "";
        document.getElementById("edit-birthdate").value = "";
        document.getElementById("edit-gender").value = "";
        document.getElementById("edit-major").value = "";
        document.getElementById("edit-class_year").value = "";
        document.getElementById("edit-program").value = "";
        document.getElementById("edit-address").value = "";
        document.getElementById("edit-email").value = "";
        document.getElementById("edit-phone_number").value = "";
        document.getElementById("edit-status").value = "";
    }
}


function onRemoveStudentClicked() {
    changeToMode("remove");
}

async function onEditStudentSaved() {
    if (!selectedStudentId) {
        setMessage("error", "Vui lòng chọn sinh viên cần sửa");
        return;
    }

    var student = {
        _id: document.getElementById("edit-student-id").value,
        name: document.getElementById("edit-name").value,
        email: document.getElementById("edit-email").value,
        phone_number: document.getElementById("edit-phone_number").value,
        address: document.getElementById("edit-address").value,
        gender: document.getElementById("edit-gender").value,
        birthdate: document.getElementById("edit-birthdate").value,
        major: document.getElementById("edit-major").value,
        class_year: document.getElementById("edit-class_year").value,
        program: document.getElementById("edit-program").value,
        status: document.getElementById("edit-status").value
    };

    try {
        const response = await fetch(`/students/${selectedStudentId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(student),
        });

        if (response.ok) {
            const result = await response.json();
            if (result.ok) {
                markDataChanged();
                changeToMode("view");
                setMessage("success", "Cập nhật thông tin sinh viên thành công!");
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            } else {
                setMessage("error", result.error || "Cập nhật thất bại");
            }
        } else {
            const error = await response.json();
            setMessage("error", error.error || "Cập nhật thất bại");
        }
    } catch (error) {
        setMessage("error", "Lỗi kết nối: " + error.message);
    }
}

async function onAddStudentSaved() {
    var student = {
        _id: document.getElementById("add-student_id").value,
        name: document.getElementById("add-name").value,
        email: document.getElementById("add-email").value,
        phone_number: document.getElementById("add-phone_number").value,
        address: document.getElementById("add-address").value,
        gender: document.getElementById("add-gender").value,
        birthdate: document.getElementById("add-birthdate").value,
        major: document.getElementById("add-major").value,
        class_year: document.getElementById("add-class_year").value,
        program: document.getElementById("add-program").value,
        status: document.getElementById("add-status").value
    };

    const response = await fetch("/students", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(student),
    });
    if (response.ok) {
        const result = await response.json();
        markDataChanged();
        changeToMode("view");
        setMessage("success", "Thêm sinh viên thành công!");
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    } else {
        const result = await response.json();
        setMessage("error", result.error);
    }
}

// MPhuong: Delete students
async function onRemoveStudentsSaved() {
    const selectedStudents = [];
    document.querySelectorAll('input[name="remove_student"]:checked').forEach(checkbox => {
        selectedStudents.push(checkbox.value);
    });

    if (selectedStudents.length === 0) {
        setMessage("warning", "Vui lòng chọn ít nhất một sinh viên để xóa.");
        return;
    }

    const response = await fetch("/students", {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ student_ids: selectedStudents }),
    });

    if (response.ok) {
        markDataChanged();
        changeToMode("view");
        setMessage("success", "Xóa sinh viên thành công!");
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    } else {
        const result = await response.json();
        setMessage("error", result.error || "Xóa sinh viên thất bại.");
    }
}

function onAddStudentCancled() {
    changeToMode("view");
}

function changeElementDisplay(element, visible) {
    let visibleDisplay = "block";
    if (element.tagName === "DIV") {
        visibleDisplay = "block";
    } else if (element.tagName === "BUTTON") {
        visibleDisplay = "inline";
    } else if (element.tagName === "TR") {
        visibleDisplay = "table-row";
    } else if (element.tagName === "TD" || element.tagName === "TH") {
        visibleDisplay = "table-cell";
    } else {
        visibleDisplay = "inline";
    }
    element.style.display = visible ? visibleDisplay : "none";
}

function setButtonState() {
    const buttonIds = ["add-student-btn", "edit-student-btn", "remove-student-btn"];
    const buttons = buttonIds.map(id => document.getElementById(id));
    switch (mode) {
        case "add":
            addState(buttons[0], "active");
            buttons[1].classList.remove("active");
            buttons[2].classList.remove("active");
            break;
        case "remove":
            addState(buttons[2], "active");
            buttons[0].classList.remove("active");
            buttons[1].classList.remove("active");
            break;
        case "edit":
            addState(buttons[1], "active");
            buttons[0].classList.remove("active");
            buttons[2].classList.remove("active");
            break;
        default:
            for (let i = 0; i < buttons.length; i++) {
                buttons[i].classList.remove("active");
            }
            break;
    }
}

function addState(element, state) {
    if (!element.classList.contains(state)) {
        element.classList.add(state);
    }
}

function markDataChanged() {
    dataChanged = true;
    const reloadButton = document.querySelector(".reload-button");
    reloadButton.style.display = "inline";
}

function setMessage(tag, messageText) {
    const message = document.getElementById("message");
    message.style.display = "block";
    message.classList.remove("info", "error", "warning", "success");
    if (tag !== "") {
        message.classList.add(tag);
    }
    message.innerHTML = messageText;
}

function changeToMode(newMode) {
    if (mode === newMode) {
        return;
    }
    if (mode !== "view") {
        const elements = document.getElementsByClassName(mode);
        for (let i = 0; i < elements.length; i++) {
            changeElementDisplay(elements[i], false);
        }
    }
    if (newMode !== "view") {
        const newElements = document.getElementsByClassName(newMode);
        for (let i = 0; i < newElements.length; i++) {
            changeElementDisplay(newElements[i], true);
        }
    }
    mode = newMode;
    setMessage("", "");
    setButtonState();
}
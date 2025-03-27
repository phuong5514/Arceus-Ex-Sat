async function addMajor() {
    const id = document.getElementById("new-major-id").value;
    const name = document.getElementById("new-major").value;
    if (!id.trim()) return alert("Nhập mã Khoa!");
    if (!name.trim()) return alert("Nhập tên Khoa!");
    const response = await fetch("/category/major", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, name }) });
    if (response.ok) {
        setMessage("success", "Thêm khoa thành công!");
        setTimeout(() => {
            window.location.reload();
        }, 2000);
    } else {
        const result = await response.json();
        setMessage("error", result.error || "Thêm khoa thất bại!");
    }
}
async function deleteMajor(id) {
    const response = await fetch(`/category/major/${id}`, { method: "DELETE" });
    if (response.ok) {
        setMessage("success", "Xóa khoa thành công!");
        setTimeout(() => {
            window.location.reload();
        }, 2000);
    } else {
        const result = await response.json();
        setMessage("error", result.error || "Xóa khoa thất bại!");
    }
}

async function addStatus() {
    const id = document.getElementById("new-status-id").value;
    const name = document.getElementById("new-status").value;
    if (!name.trim()) return alert("Nhập tên tình trạng!");
    const response = await fetch("/category/status", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, name }) });
    if (response.ok) {
        setMessage("success", "Thêm tình trạng thành công!");
        setTimeout(() => {
            window.location.reload();
        }, 2000);
    } else {
        const result = await response.json();
        setMessage("error", result.error || "Thêm tình trạng thất bại!");
    }
}

async function deleteStatus(id) {
    const response = await fetch(`/category/status/${id}`, { method: "DELETE" });
    if (response.ok) {
        setMessage("success", "Xóa tình trạng thành công!");
        setTimeout(() => {
            window.location.reload();
        }, 2000);
    } else {
        const result = await response.json();
        setMessage("error", result.error || "Xóa tình trạng thất bại!");
    }
}

async function addProgram() {
    const id = document.getElementById("new-program-id").value;
    const name = document.getElementById("new-program").value;
    if (!name.trim()) return alert("Nhập tên chương trình!");
    
    const response = await fetch("/category/program", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, name }) });
    if (response.ok) {
        setMessage("success", "Thêm chương trình thành công!");
        setTimeout(() => {
            window.location.reload();
        }, 2000);
    } else {
        const result = await response.json();
        setMessage("error", result.error || "Thêm chương trình thất bại!");
    }
}

async function deleteProgram(id) {
    const response = await fetch(`/category/program/${id}`, { method: "DELETE" });
    if (response.ok) {
        setMessage("success", "Xóa chương trình thành công!");
        setTimeout(() => {
            window.location.reload();
        }, 2000);
    } else {
        const result = await response.json();
        setMessage("error", result.error || "Xóa chương trình thất bại!");
    }
}

async function renameMajor(event, nameInput){
    if (event.key !== "Enter") return;
    const id = nameInput.dataset.id;
    const name = nameInput.value;
    const response = await fetch(`/category/major/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
    if (response.ok) {
        setMessage("success", "Đổi tên khoa thành công!");
        setTimeout(() => {
            window.location.reload();
        }, 2000);
    } else {
        const result = await response.json();
        setMessage("error", result.error);
    }
}

async function renameStatus(event, nameInput){
    if (event.key !== "Enter") return;
    const id = nameInput.dataset.id;
    const name = nameInput.value;
    const response = await fetch(`/category/status/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
    if (response.ok) {
        setMessage("success", "Đổi tên tình trạng thành công!");
        setTimeout(() => {
            window.location.reload();
        }, 2000);
    } else {
        const result = await response.json();
        setMessage("error", result.error);
    }
}

async function renameProgram(event, nameInput){
    if (event.key !== "Enter") return;
    console.log("renbamoing program");
    const id = nameInput.dataset.id;
    const name = nameInput.value;
    const response = await fetch(`/category/program/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
    if (response.ok) {
        setMessage("success", "Đổi tên chương trình thành công!");
        setTimeout(() => {
            window.location.reload();
        }, 2000);
    } else {
        const result = await response.json();
        setMessage("error", result.error);
    }
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

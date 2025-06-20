async function addMajor() {
    const id = document.getElementById("new-major-id").value;
    const name = document.getElementById("new-major").value;
    if (!id.trim()){
        setMessage("error", window.t ? t("major_id_required") : "Vui lòng nhập mã khoa");
        return;
    }
    if (!name.trim()){
        setMessage("error", window.t ? t("major_name_required") : "Vui lòng nhập tên khoa");
        return;
    }
    const response = await fetch("category/major", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, name }) });
    const result = await response.json();
    if (response.ok && result.ok) {
        setMessage("success", result.message || (window.t ? t("add_major_success") : "Thêm khoa thành công!"));
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    } else {
        setMessage("error", result.message || result.error || (window.t ? t("add_major_failed") : "Thêm khoa thất bại!"));
    }
}

async function deleteMajor(id) {
    const response = await fetch(`category/major/${id}`, { method: "DELETE" });
    const result = await response.json();
    if (response.ok && result.ok) {
        setMessage("success", result.message || (window.t ? t("delete_major_success") : "Xóa khoa thành công!"));
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    } else {
        setMessage("error", result.message || result.error || (window.t ? t("delete_major_failed") : "Xóa khoa thất bại!"));
    }
}

async function addStatus() {
    const id = document.getElementById("new-status-id").value;
    const name = document.getElementById("new-status").value;
    if (!id.trim()) return alert(window.t ? t("status_id_required") : (lang === "en" ? "Please Enter Study Status Code!" : "Nhập mã tình trạng!"));
    if (!name.trim()) return alert(window.t ? t("status_name_required") : (lang === "en" ? "Please Enter Study Status Name!" : "Nhập tên tình trạng!"));
    const response = await fetch("category/status", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, name }) });
    const result = await response.json();
    if (response.ok && result.ok) {
        setMessage("success", result.message || (window.t ? t("add_status_success") : "Thêm tình trạng thành công!"));
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    } else {
        setMessage("error", result.message || result.error || (window.t ? t("add_status_failed") : "Thêm tình trạng thất bại!"));
    }
}

async function deleteStatus(id) {
    const response = await fetch(`category/status/${id}`, { method: "DELETE" });
    const result = await response.json();
    if (response.ok && result.ok) {
        setMessage("success", result.message || (window.t ? t("delete_status_success") : "Xóa tình trạng thành công!"));
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    } else {
        setMessage("error", result.message || result.error || (window.t ? t("delete_status_failed") : "Xóa tình trạng thất bại!"));
    }
}

async function addProgram() {
    const id = document.getElementById("new-program-id").value;
    const name = document.getElementById("new-program").value;
    if (!id.trim()) return alert(window.t ? t("program_id_required") : "Nhập mã chương trình!");
    if (!name.trim()) return alert(window.t ? t("program_name_required") : "Nhập tên chương trình!");
    const response = await fetch("category/program", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, name }) });
    const result = await response.json();
    if (response.ok && result.ok) {
        setMessage("success", result.message || (window.t ? t("add_program_success") : "Thêm chương trình thành công!"));
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    } else {
        setMessage("error", result.message || result.error || (window.t ? t("add_program_failed") : "Thêm chương trình thất bại!"));
    }
}

async function deleteProgram(id) {
    const response = await fetch(`category/program/${id}`, { method: "DELETE" });
    const result = await response.json();
    if (response.ok && result.ok) {
        setMessage("success", result.message || (window.t ? t("delete_program_success") : "Xóa chương trình thành công!"));
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    } else {
        setMessage("error", result.message || result.error || (window.t ? t("delete_program_failed") : "Xóa chương trình thất bại!"));
    }
}

async function renameMajor(event, nameInput){
    if (event.key !== "Enter") return;
    const id = nameInput.dataset.id;
    const name = nameInput.value;
    const response = await fetch(`category/major/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
    const result = await response.json();
    if (response.ok && result.ok) {
        setMessage("success", result.message || (window.t ? t("rename_major_success") : "Đổi tên khoa thành công!"));
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    } else {
        setMessage("error", result.message || result.error || (window.t ? t("rename_major_failed") : "Đổi tên khoa thất bại!"));
    }
}

async function renameStatus(event, nameInput){
    if (event.key !== "Enter") return;
    const id = nameInput.dataset.id;
    const name = nameInput.value;
    const response = await fetch(`category/status/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
    const result = await response.json();
    if (response.ok && result.ok) {
        setMessage("success", result.message || (window.t ? t("rename_status_success") : "Đổi tên tình trạng thành công!"));
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    } else {
        setMessage("error", result.message || result.error || (window.t ? t("rename_status_failed") : "Đổi tình trạng thất bại!"));
    }
}

async function renameProgram(event, nameInput){
    if (event.key !== "Enter") return;
    const id = nameInput.dataset.id;
    const name = nameInput.value;
    const response = await fetch(`category/program/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
    const result = await response.json();
    if (response.ok && result.ok) {
        setMessage("success", result.message || (window.t ? t("rename_program_success") : "Đổi tên chương trình thành công!"));
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    } else {
        setMessage("error", result.message || result.error || (window.t ? t("rename_program_failed") : "Đổi tên chương trình thất bại!"));
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

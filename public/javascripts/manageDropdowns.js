async function addMajor() {
    const name = document.getElementById("new-major").value;
    if (!name.trim()) return alert("Nhập tên Khoa!");
    await fetch("/manage-dropdowns/major", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
    window.location.reload();
}
async function deleteMajor(id) {
    await fetch(`/manage-dropdowns/major/${id}`, { method: "DELETE" });
    window.location.reload();
}

async function addStatus() {
    const name = document.getElementById("new-status").value;
    if (!name.trim()) return alert("Nhập tên tình trạng!");
    await fetch("/manage-dropdowns/status", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
    window.location.reload();
}

async function deleteStatus(id) {
    await fetch(`/manage-dropdowns/status/${id}`, { method: "DELETE" });
    window.location.reload();
}

async function addProgram() {
    const name = document.getElementById("new-program").value;
    if (!name.trim()) return alert("Nhập tên chương trình!");
    await fetch("/manage-dropdowns/program", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
    window.location.reload();
}

async function deleteProgram(id) {
    await fetch(`/manage-dropdowns/program/${id}`, { method: "DELETE" });
    window.location.reload();
}


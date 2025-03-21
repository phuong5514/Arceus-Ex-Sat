let mode = "view";
let dataChanged = false;
let selectedRow = null;
let searchOptionsExpanded = false;

function onAddStudentClicked() {
    changeToMode("add");
}

function onEditStudentClicked() {
    changeToMode("edit");
}

//Minh Phuong: function to add students with structure from Ẽ02
function onIdentificationTypeChange() {
    const type = document.getElementById("add-identification-type").value;
    
    // Get input fields
    const idNumber = document.getElementById("add-identification-number");
    const issueDate = document.getElementById("add-identification-issue-date");
    const expiryDate = document.getElementById("add-identification-expiry-date");
    const issueLocation = document.getElementById("add-identification-issue-location");
    const passportCountry = document.getElementById("add-passport-country");
    const passportNotes = document.getElementById("add-passport-notes");
    const cccdChipLabel = document.getElementById("cccd-chip-label");
    const cccdChipCheckbox = document.getElementById("add-cccd-chip");

    // Reset all fields to hidden by default
    passportCountry.style.display = "none";
    passportNotes.style.display = "none";
    cccdChipLabel.style.display = "none";
    cccdChipCheckbox.style.display = "none";

    if (type === "CMND" || type === "CCCD") {
        // Show fields for CMND & CCCD
        idNumber.placeholder = "Số CMND/CCCD";
        issueDate.style.display = "inline-block";
        expiryDate.style.display = "inline-block";
        issueLocation.style.display = "inline-block";

        if (type === "CCCD") {
            // Show CCCD chip checkbox
            cccdChipLabel.style.display = "inline-block";
            cccdChipCheckbox.style.display = "inline-block";
        }
    } else if (type === "Passport") {
        // Show fields for Passport
        idNumber.placeholder = "Số hộ chiếu";
        issueDate.style.display = "inline-block";
        expiryDate.style.display = "inline-block";
        issueLocation.style.display = "inline-block";
        passportCountry.style.display = "inline-block";
        passportNotes.style.display = "inline-block";
    }
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

// async function onEditStudentSaved() {
//     if (!selectedStudentId) {
//         setMessage("error", "Vui lòng chọn sinh viên cần sửa");
//         return;
//     }

//     var student = {
//         _id: document.getElementById("edit-student-id").value,
//         name: document.getElementById("edit-name").value,
//         email: document.getElementById("edit-email").value,
//         phone_number: document.getElementById("edit-phone_number").value,
//         address: document.getElementById("edit-address").value,
//         gender: document.getElementById("edit-gender").value,
//         birthdate: document.getElementById("edit-birthdate").value,
//         major: document.getElementById("edit-major").value,
//         class_year: document.getElementById("edit-class_year").value,
//         program: document.getElementById("edit-program").value,
//         status: document.getElementById("edit-status").value
//     };

//     try {
//         const response = await fetch(`/students/${selectedStudentId}`, {
//             method: "PUT",
//             headers: {
//                 "Content-Type": "application/json",
//             },
//             body: JSON.stringify(student),
//         });

//         if (response.ok) {
//             const result = await response.json();
//             if (result.ok) {
//                 markDataChanged();
//                 changeToMode("view");
//                 setMessage("success", "Cập nhật thông tin sinh viên thành công!");
//                 setTimeout(() => {
//                     window.location.reload();
//                 }, 1000);
//             } else {
//                 setMessage("error", result.error || "Cập nhật thất bại");
//             }
//         } else {
//             const error = await response.json();
//             setMessage("error", error.error || "Cập nhật thất bại");
//         }
//     } catch (error) {
//         setMessage("error", "Lỗi kết nối: " + error.message);
//     }
// }

// async function onAddStudentSaved() {
//     var student = {
//         _id: document.getElementById("add-student_id").value,
//         name: document.getElementById("add-name").value,
//         email: document.getElementById("add-email").value,
//         phone_number: document.getElementById("add-phone_number").value,
//         address: document.getElementById("add-address").value,
//         gender: document.getElementById("add-gender").value,
//         birthdate: document.getElementById("add-birthdate").value,
//         major: document.getElementById("add-major").value,
//         class_year: document.getElementById("add-class_year").value,
//         program: document.getElementById("add-program").value,
//         status: document.getElementById("add-status").value
//     };

//     const response = await fetch("/students", {
//         method: "POST",
//         headers: {
//             "Content-Type": "application/json",
//         },
//         body: JSON.stringify(student),
//     });
//     if (response.ok) {
//         const result = await response.json();
//         markDataChanged();
//         changeToMode("view");
//         setMessage("success", "Thêm sinh viên thành công!");
//         setTimeout(() => {
//             window.location.reload();
//         }, 1000);
//     } else {
//         const result = await response.json();
//         setMessage("error", result.error);
//     }
// }


//Minh Phuong: Modify to add students

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

        nationality: document.getElementById("edit-nationality").value,

        permanent_address: {
            house_number_street: document.getElementById("edit-permanent-house").value,
            ward_commune: document.getElementById("edit-permanent-ward").value,
            district: document.getElementById("edit-permanent-district").value,
            province_city: document.getElementById("edit-permanent-province").value,
            country: document.getElementById("edit-permanent-country").value
        },

        temporary_address: document.getElementById("edit-temporary-house").value.trim()
            ? {
                house_number_street: document.getElementById("edit-temporary-house").value,
                ward_commune: document.getElementById("edit-temporary-ward").value,
                district: document.getElementById("edit-temporary-district").value,
                province_city: document.getElementById("edit-temporary-province").value,
                country: document.getElementById("edit-temporary-country").value
            }
            : null,

        mailing_address: document.getElementById("edit-mailing-house").value.trim()
            ? {
                house_number_street: document.getElementById("edit-mailing-house").value,
                ward_commune: document.getElementById("edit-mailing-ward").value,
                district: document.getElementById("edit-mailing-district").value,
                province_city: document.getElementById("edit-mailing-province").value,
                country: document.getElementById("edit-mailing-country").value
            }
            : null,

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
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(student),
        });

        if (response.ok) {
            markDataChanged();
            changeToMode("view");
            setMessage("success", "Cập nhật thông tin sinh viên thành công!");
            setTimeout(() => window.location.reload(), 1000);
        } else {
            const error = await response.json();
            setMessage("error", error.error || "Cập nhật thất bại");
        }
    } catch (error) {
        setMessage("error", "Lỗi kết nối: " + error.message);
    }
}

async function onAddStudentSaved() {
    const identificationType = document.getElementById("add-identification-type").value;

    var student = {
        _id: document.getElementById("add-student_id").value,
        name: document.getElementById("add-name").value,
        email: document.getElementById("add-email").value,
        phone_number: document.getElementById("add-phone_number").value,
        
        //Permanent Address (Object)
        permanent_address: {
            house_number_street: document.getElementById("add-permanent-house").value,
            ward_commune: document.getElementById("add-permanent-ward").value,
            district: document.getElementById("add-permanent-district").value,
            province_city: document.getElementById("add-permanent-province").value,
            country: document.getElementById("add-permanent-country").value
        },

        //Optional Addresses
        temporary_address: document.getElementById("add-temporary-house").value.trim() 
            ? {
                house_number_street: document.getElementById("add-temporary-house").value,
                ward_commune: document.getElementById("add-temporary-ward").value,
                district: document.getElementById("add-temporary-district").value,
                province_city: document.getElementById("add-temporary-province").value,
                country: document.getElementById("add-temporary-country").value
            } 
            : null,
        mailing_address: document.getElementById("add-mailing-house").value.trim() 
            ? {
                house_number_street: document.getElementById("add-mailing-house").value,
                ward_commune: document.getElementById("add-mailing-ward").value,
                district: document.getElementById("add-mailing-district").value,
                province_city: document.getElementById("add-mailing-province").value,
                country: document.getElementById("add-mailing-country").value
            } 
            : null,

        gender: document.getElementById("add-gender").value,
        birthdate: document.getElementById("add-birthdate").value,
        major: document.getElementById("add-major").value,
        class_year: document.getElementById("add-class_year").value,
        program: document.getElementById("add-program").value,
        status: document.getElementById("add-status").value,
        nationality: document.getElementById("add-nationality").value,

        //Identification (Only if type is selected)
        identification: identificationType 
            ? {
                type: identificationType === "CCCD" || identificationType === "CMND" ? "IdentityCard" : "Passport",
                id: document.getElementById("add-identification-number").value,
                issue_date: document.getElementById("add-identification-issue-date").value,
                expiry_date: document.getElementById("add-identification-expiry-date").value,
                issue_location: document.getElementById("add-identification-issue-location").value
            }
            : null
    };

    //If CCCD, add `is_digitized`
    if (identificationType === "CCCD") {
        student.identification.is_digitized = document.getElementById("add-cccd-chip").checked;
    }

    //If Passport, add `country_code` and `notes`
    if (identificationType === "Passport") {
        student.identification.country_code = document.getElementById("add-passport-country").value;
        student.identification.notes = document.getElementById("add-passport-notes").value;
    }
    console.log("Sending student data:", student); //Debug Log

    const response = await fetch("/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(student),
    });

    const result = await response.json();
    if (response.ok) {
        window.location.reload();
    } else {
        alert(result.error);
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

function onSearchOptionsButtonClicked(){
    const optionsPanel = document.getElementById("more-search-options");
    searchOptionsExpanded = optionsPanel.style.display != "none";
    searchOptionsExpanded = !searchOptionsExpanded;
    const button = document.getElementById("more-search-options-button");
    if (searchOptionsExpanded){
        button.style.transform = "scale(-1,1)";
    } else {
        button.style.transform = "scale(1,1)";
    }
    optionsPanel.style.display = searchOptionsExpanded ? "inline" : "none";
}
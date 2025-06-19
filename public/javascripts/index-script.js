let mode = "view";
let dataChanged = false;
let selectedRow = null;
let searchOptionsExpanded = false;
let currentEditAddressDiv = null;
let selectedStudentId = null;

function setValues(parentNode, valuesObj) {
    if (!parentNode || typeof parentNode.getElementById !== "function") {
        throw new Error("Invalid parentNode provided");
    }
    if (typeof valuesObj !== "object" || valuesObj === null || Array.isArray(valuesObj)) {
        throw new Error("valuesObj must be a non-null object");
    }

    Object.entries(valuesObj).forEach(([id, value]) => {
        if (typeof id !== "string") return;
        const childElement = parentNode.getElementById(id);
        if (childElement && "value" in childElement) {
            childElement.value = value;
        }
    });
};

function clearValues(parentNode, ids) {
    if (!parentNode || typeof parentNode.getElementById !== "function") {
        throw new Error("Invalid parentNode provided");
    }
    if (!Array.isArray(ids)) {
        throw new Error("ids must be an array");
    }

    ids.forEach((id) => {
        if (typeof id !== "string") return;
        const childElement = parentNode.getElementById(id);
        if (childElement && "value" in childElement) {
            childElement.value = "";
        }
    });
};

function toggleReadOnly(parentNode, ids) {
    if (!parentNode || typeof parentNode.getElementById !== "function") {
        throw new Error("Invalid parentNode provided");
    }
    if (!Array.isArray(ids)) {
        throw new Error("ids must be an array");
    }

    ids.forEach((id) => {
        const childElement = parentNode.getElementById(id);
        const readOnlyValue = !childElement.readOnly;
        childElement.readOnly = !readOnlyValue;
    })
}

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

    document.querySelectorAll('.edit-checkbox').forEach(cb => {
        if (cb !== checkbox) {
            cb.checked = false;
        } else {
            cb.checked = true;
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
        
        setValues(document, {
            "edit-student_id": cells[1].textContent.trim(),
            "edit-name": cells[2].textContent.trim(),
            "edit-gender": cells[4].textContent.trim(),
            "edit-major": cells[5].getAttribute("name"),
            "edit-class_year": cells[6].textContent.trim(),
            "edit-program": cells[7].getAttribute("name"),
            "edit-email": cells[13].textContent.trim(),
            "edit-phone_number": cells[14].textContent.trim(),
            "edit-status": cells[15].getAttribute("name"),
            "edit-nationality": cells[16].textContent.trim()
        });


        const birthdate = cells[3].textContent.trim();
        if (birthdate && birthdate !== 'Invalid Date') {
            const [day, month, year] = birthdate.split('/');
            setValues(document, {
                "edit-birthdate": `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
            });
        } else {
            clearValues(document, ["edit-birthdate"]);
        }

        

        applyIdentityCardEdit(getIdentityCardFromDiv(cells[8].querySelector("div")), document.getElementById("edit-identity_card"));
        applyPassportEdit(getPassportFromDiv(cells[9].querySelector("div")), document.getElementById("edit-passport"));

        applyAddressEdit(getAddressFromAddressDiv(cells[10].querySelector("div")), document.getElementById("edit-address_permanent"));
        applyAddressEdit(getAddressFromAddressDiv(cells[11].querySelector("div")), document.getElementById("edit-address_temporary"));
        applyAddressEdit(getAddressFromAddressDiv(cells[12].querySelector("div")), document.getElementById("edit-address_mailing"));


        setMessage("info", `Đang chỉnh sửa thông tin sinh viên: ${studentId}, ${studentName}, ${birthdate}`);
    } else {
        selectedRow = null;
        selectedStudentId = null;
        setMessage("", "");
        
        clearValues(document, [
            "edit-student_id",
            "edit-name",
            "edit-birthdate",
            "edit-gender",
            "edit-major",
            "edit-class_year",
            "edit-program",
            "edit-email",
            "edit-phone_number",
            "edit-status",
        ]);
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

    const student = {
        _id: document.getElementById("edit-student_id").value,
        name: document.getElementById("edit-name").value,
        email: document.getElementById("edit-email").value,
        phone_number: document.getElementById("edit-phone_number").value,
        address: "",
        gender: document.getElementById("edit-gender").value,
        birthdate: document.getElementById("edit-birthdate").value,
        major: document.getElementById("edit-major").value,
        class_year: parseInt(document.getElementById("edit-class_year").value),
        program: document.getElementById("edit-program").value,
        status: document.getElementById("edit-status").value,
        permanent_address: null,
        temporary_address: null,
        mailing_address: null,
        identity_card: null,
        nationality: document.getElementById("edit-nationality").value
    };

    student.permanent_address = getAddressFromAddressDiv(document.getElementById("edit-address_permanent"));
    student.temporary_address = getAddressFromAddressDiv(document.getElementById("edit-address_temporary"));
    student.mailing_address = getAddressFromAddressDiv(document.getElementById("edit-address_mailing"));

    student.identity_card = getIdentityCardFromDiv(document.getElementById("edit-identity_card"));
    student.passport = getPassportFromDiv(document.getElementById("edit-passport"));

    if (student.identity_card._id === "") {
        student.identity_card = null;
    }
    if (student.passport._id === "") {
        student.passport = null;
    }
    
    setMessage("info", "Đang thay đổi...");
    
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
}

async function onAddStudentSaved() {
    // const identificationType = document.getElementById("add-identification-type").value;

    var student = {
        _id: document.getElementById("add-student_id").value,
        name: document.getElementById("add-name").value,
        email: document.getElementById("add-email").value,
        phone_number: document.getElementById("add-phone_number").value,
        address: "",
        gender: document.getElementById("add-gender").value,
        birthdate: document.getElementById("add-birthdate").value,
        major: document.getElementById("add-major").value, 
        class_year: parseInt(document.getElementById("add-class_year").value),
        program: document.getElementById("add-program").value,
        status: document.getElementById("add-status").value,
        permanent_address: null,
        temporary_address: null,
        mailing_address: null,
        identity_card: null,
        nationality: document.getElementById("add-nationality").value
    };

    student.permanent_address = getAddressFromAddressDiv(document.getElementById("add-address_permanent"));
    student.temporary_address = getAddressFromAddressDiv(document.getElementById("add-address_temporary"));
    student.mailing_address = getAddressFromAddressDiv(document.getElementById("add-address_mailing"));

    student.identity_card = getIdentityCardFromDiv(document.getElementById("add-identity_card"));
    student.passport = getPassportFromDiv(document.getElementById("add-passport"));

    setMessage("info", "Đang thêm...")
    
    const response = await fetch("/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(student),
    });

    if (response.ok) {
        window.location.reload();
    } else {
        const result = await response.json();
        setMessage("error", result.error || "Thêm sinh viên thất bại"); 
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

    setMessage("info", "Đang xóa...");
    
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

function onAddressEditClicked(button) {
    const addressDialog = document.getElementById("address-dialog");
    addressDialog.showModal();
    currentEditAddressDiv = button.closest("div");
    if (!currentEditAddressDiv) return;

    const addressData = getAddressFromAddressDiv(currentEditAddressDiv);

    document.getElementById("address-house_number").readOnly = false;
    document.getElementById("address-street").readOnly = false;
    document.getElementById("address-ward").readOnly = false;
    document.getElementById("address-district").readOnly = false;
    document.getElementById("address-city").readOnly = false;
    document.getElementById("address-country").readOnly = false;
    document.getElementById("address-postal_code").readOnly = false;

    document.getElementById("address-house_number").value = addressData.house_number;
    document.getElementById("address-street").value = addressData.street;
    document.getElementById("address-ward").value = addressData.ward;
    document.getElementById("address-district").value = addressData.district;
    document.getElementById("address-city").value = addressData.city;
    document.getElementById("address-country").value = addressData.country;
    document.getElementById("address-postal_code").value = addressData.postal_code;
}

function onAddressDialogSubmitted(event) {
    event.preventDefault();
    const addressDialog = document.getElementById("address-dialog");

    if (!currentEditAddressDiv) {
        addressDialog.close();
        return;
    }

    const houseNumber = document.getElementById("address-house_number").value;
    const street = document.getElementById("address-street").value;
    const ward = document.getElementById("address-ward").value;
    const district = document.getElementById("address-district").value;
    const city = document.getElementById("address-city").value;
    const country = document.getElementById("address-country").value;
    const postalCode = document.getElementById("address-postal_code").value;

    applyAddressEdit({
        house_number : houseNumber,
        street,
        ward,
        district,
        city,
        country,
        postal_code : postalCode
    }, currentEditAddressDiv);

    addressDialog.close();

    currentEditAddressDiv = null;
}

function applyAddressEdit(addressData, addressCell) {
    addressCell.querySelector("input[name='house_number']").value = addressData.house_number;
    addressCell.querySelector("input[name='street']").value = addressData.street;
    addressCell.querySelector("input[name='ward']").value = addressData.ward;
    addressCell.querySelector("input[name='district']").value = addressData.district;
    addressCell.querySelector("input[name='city']").value = addressData.city;
    addressCell.querySelector("input[name='country']").value = addressData.country;
    addressCell.querySelector("input[name='postal_code']").value = addressData.postal_code;
    
    const addressArray = Object.values(addressData).filter(value => value);
    const displayAddress = addressArray.join(", ");
    
    addressCell.querySelector(".address-text").value = displayAddress;
}

function getAddressFromAddressDiv(addressDiv){
    return {
        house_number: addressDiv.querySelector("input[name='house_number']").value,
        street: addressDiv.querySelector("input[name='street']").value,
        ward: addressDiv.querySelector("input[name='ward']").value,
        district: addressDiv.querySelector("input[name='district']").value,
        city: addressDiv.querySelector("input[name='city']").value,
        country: addressDiv.querySelector("input[name='country']").value,
        postal_code: addressDiv.querySelector("input[name='postal_code']").value
    }
}

let currentEditIdentityCardDiv = null;

function onIdentityCardEditClicked(button) {
    const identityCardDialog = document.getElementById("identity-card-dialog");
    identityCardDialog.showModal();
    currentEditIdentityCardDiv = button.closest("div");
    if (!currentEditIdentityCardDiv) return;

    const identityCardData = getIdentityCardFromDiv(currentEditIdentityCardDiv);

    // setValues(
    //     document,
    //     {

    //     }
    // )

    // setReadOnly(document, [

    // ], false);

    document.getElementById("identity-card-id").readOnly = false;
    document.getElementById("identity-card-issue-date").readOnly = false;
    document.getElementById("identity-card-expiry-date").readOnly = false;
    document.getElementById("identity-card-issue-location").readOnly = false;
    document.getElementById("identity-card-is-digitized").readOnly = false;
    document.getElementById("identity-card-chip-attached").readOnly = false;

    // setValues(document, {})
    document.getElementById("identity-card-id").value = identityCardData._id;
    document.getElementById("identity-card-issue-date").value = identityCardData.issue_date;
    document.getElementById("identity-card-expiry-date").value = identityCardData.expiry_date;
    document.getElementById("identity-card-issue-location").value = identityCardData.issue_location;
    document.getElementById("identity-card-is-digitized").checked = identityCardData.is_digitized;
    document.getElementById("identity-card-chip-attached").checked = identityCardData.chip_attached;
}

function onIdentityCardDialogSubmitted(event) {
    event.preventDefault();
    const identityCardDialog = document.getElementById("identity-card-dialog");
    if (!currentEditIdentityCardDiv) {
        identityCardDialog.close();
        return;
    }

    const identityCardId = document.getElementById("identity-card-id").value;
    const issueDate = document.getElementById("identity-card-issue-date").value;
    const expiryDate = document.getElementById("identity-card-expiry-date").value;
    const issueLocation = document.getElementById("identity-card-issue-location").value;
    const isDigitized = document.getElementById("identity-card-is-digitized").checked;
    const chipAttached = document.getElementById("identity-card-chip-attached").checked;

    applyIdentityCardEdit({
        _id: identityCardId,
        issue_date: issueDate,
        expiry_date: expiryDate,
        issue_location: issueLocation,
        is_digitized: isDigitized,
        chip_attached: chipAttached
    }, currentEditIdentityCardDiv);

    identityCardDialog.close();

    currentEditIdentityCardDiv = null;
}

function applyIdentityCardEdit(identityCardData, identityCardCell) {
    identityCardCell.querySelector("input[name='identity_card_id']").value = identityCardData._id;
    identityCardCell.querySelector("input[name='issue_date']").value = identityCardData.issue_date;
    identityCardCell.querySelector("input[name='expiry_date']").value = identityCardData.expiry_date;
    identityCardCell.querySelector("input[name='issue_location']").value = identityCardData.issue_location;
    identityCardCell.querySelector("input[name='is_digitized']").checked = identityCardData.is_digitized;
    identityCardCell.querySelector("input[name='chip_attached']").checked = identityCardData.chip_attached;
    
    const displayIdentityCard = `${identityCardData._id}`;
    identityCardCell.querySelector(".identity_card-text").value = displayIdentityCard;
}

function getIdentityCardFromDiv(identityCardDiv) {
    const id = identityCardDiv.querySelector("input[name='identity_card_id']").value;
    if (!id) return null;
    
    return {
        _id: id,
        issue_date: identityCardDiv.querySelector("input[name='issue_date']").value,
        expiry_date: identityCardDiv.querySelector("input[name='expiry_date']").value,
        issue_location: identityCardDiv.querySelector("input[name='issue_location']").value,
        is_digitized: identityCardDiv.querySelector("input[name='is_digitized']").checked,
        chip_attached: identityCardDiv.querySelector("input[name='chip_attached']").checked
    }
}

function onIdentityCardInfoClicked(button){
    const identityCardDialog = document.getElementById("identity-card-dialog");
    const currentDiv = button.closest("div");
    if (!currentDiv) return;
    const identityCardData = getIdentityCardFromDiv(currentDiv);
    if (!identityCardData._id) return;
    document.getElementById("identity-card-id").value = identityCardData._id;
    document.getElementById("identity-card-issue-date").value = identityCardData.issue_date;
    document.getElementById("identity-card-expiry-date").value = identityCardData.expiry_date;
    document.getElementById("identity-card-issue-location").value = identityCardData.issue_location;
    document.getElementById("identity-card-is-digitized").checked = identityCardData.is_digitized;
    document.getElementById("identity-card-chip-attached").checked = identityCardData.chip_attached;

    // set all of them readonly
    document.getElementById("identity-card-id").readOnly = true;
    document.getElementById("identity-card-issue-date").readOnly = true;
    document.getElementById("identity-card-expiry-date").readOnly = true;
    document.getElementById("identity-card-issue-location").readOnly = true;
    document.getElementById("identity-card-is-digitized").readOnly = true;
    document.getElementById("identity-card-chip-attached").readOnly = true;

    identityCardDialog.showModal();
}

function onAddressInfoClicked(button) {
    const addressDialog = document.getElementById("address-dialog");
    const currentDiv = button.closest("div");
    if (!currentDiv) return;
    const addressData = getAddressFromAddressDiv(currentDiv);
    if (Object.values(addressData).every(x => x === '')) return;
    addressDialog.showModal();
    
    document.getElementById("address-house_number").value = addressData.house_number;
    document.getElementById("address-street").value = addressData.street;
    document.getElementById("address-ward").value = addressData.ward;
    document.getElementById("address-district").value = addressData.district;
    document.getElementById("address-city").value = addressData.city;
    document.getElementById("address-country").value = addressData.country;
    document.getElementById("address-postal_code").value = addressData.postal_code;

    document.getElementById("address-house_number").readOnly = true;
    document.getElementById("address-street").readOnly = true;
    document.getElementById("address-ward").readOnly = true;
    document.getElementById("address-district").readOnly = true;
    document.getElementById("address-city").readOnly = true;
    document.getElementById("address-country").readOnly = true;
    document.getElementById("address-postal_code").readOnly = true;
}

let currentEditPassportDiv = null;

function onPassportEditClicked(button) {
    const passportDialog = document.getElementById("passport-dialog");
    passportDialog.showModal();
    currentEditPassportDiv = button.closest("div");
    if (!currentEditPassportDiv) return;

    const passportData = getPassportFromDiv(currentEditPassportDiv);

    document.getElementById("passport-id").readOnly = false;
    document.getElementById("passport-type").readOnly = false;
    document.getElementById("passport-country-code").readOnly = false;
    document.getElementById("passport-issue-date").readOnly = false;
    document.getElementById("passport-expiry-date").readOnly = false;
    document.getElementById("passport-issue-location").readOnly = false;
    document.getElementById("passport-notes").readOnly = false;

    document.getElementById("passport-id").value = passportData._id;
    document.getElementById("passport-type").value = passportData.type;
    document.getElementById("passport-country-code").value = passportData.country_code;
    document.getElementById("passport-issue-date").value = passportData.issue_date;
    document.getElementById("passport-expiry-date").value = passportData.expiry_date;
    document.getElementById("passport-notes").value = passportData.notes;
}

function onPassportDialogSubmitted(event) {
    event.preventDefault();
    const passportDialog = document.getElementById("passport-dialog");

    if (!currentEditPassportDiv) {
        passportDialog.close();
        return;
    }

    const passportId = document.getElementById("passport-id").value;
    const type = document.getElementById("passport-type").value;
    const countryCode = document.getElementById("passport-country-code").value;
    const issueDate = document.getElementById("passport-issue-date").value;
    const expiryDate = document.getElementById("passport-expiry-date").value;
    const issueLocation = document.getElementById("passport-issue-location").value;
    const notes = document.getElementById("passport-notes").value;

    applyPassportEdit({
        _id: passportId,
        type,
        country_code: countryCode,
        issue_date: issueDate,
        expiry_date: expiryDate,
        issue_location: issueLocation,
        notes: notes,
    }, currentEditPassportDiv);

    passportDialog.close();

    currentEditPassportDiv = null;
}

function applyPassportEdit(passportData, passportCell) {
    passportCell.querySelector("input[name='passport_id']").value = passportData._id;
    passportCell.querySelector("input[name='type']").value = passportData.type;
    passportCell.querySelector("input[name='country_code']").value = passportData.country_code;
    passportCell.querySelector("input[name='issue_date']").value = passportData.issue_date;
    passportCell.querySelector("input[name='expiry_date']").value = passportData.expiry_date;
    passportCell.querySelector("input[name='issue_location']").value = passportData.issue_location;
    passportCell.querySelector("input[name='notes']").value = passportData.notes;

    const displayPassport = `${passportData._id}`;
    passportCell.querySelector(".passport-text").value = displayPassport;
}

function getPassportFromDiv(passportDiv) {
    const id = passportDiv.querySelector("input[name='passport_id']").value;
    if (!id) return null;
    return {
        _id: id,
        type: passportDiv.querySelector("input[name='type']").value,
        country_code: passportDiv.querySelector("input[name='country_code']").value,
        issue_date: passportDiv.querySelector("input[name='issue_date']").value,
        expiry_date: passportDiv.querySelector("input[name='expiry_date']").value,
        issue_location: passportDiv.querySelector("input[name='issue_location']").value,
        notes: passportDiv.querySelector("input[name='notes']").value
    }
}

function onPassportInfoClicked(button) {
    const passportDialog = document.getElementById("passport-dialog");
    const currentDiv = button.closest("div");
    if (!currentDiv) return;
    const passportData = getPassportFromDiv(currentDiv);
    if (!passportData._id) return;
    document.getElementById("passport-id").value = passportData._id;
    document.getElementById("passport-type").value = passportData.type;
    document.getElementById("passport-country-code").value = passportData.country_code;
    document.getElementById("passport-issue-date").value = passportData.issue_date;
    document.getElementById("passport-expiry-date").value = passportData.expiry_date;
    document.getElementById("passport-issue-location").value = passportData.issue_location;
    document.getElementById("passport-notes").value = passportData.notes;

    // set all of them readonly
    document.getElementById("passport-id").readOnly = true;
    document.getElementById("passport-type").readOnly = true;
    document.getElementById("passport-country-code").readOnly = true;
    document.getElementById("passport-issue-date").readOnly = true;
    document.getElementById("passport-expiry-date").readOnly = true;
    document.getElementById("passport-issue-location").readOnly = true;
    document.getElementById("passport-notes").readOnly = true;

    passportDialog.showModal();
}

function exportData() {
    const format = document.getElementById('export-format').value;
    window.location.href = `student/export-download?format=${format}`;
}

function onSearchSubmitted(event) {
    event.preventDefault();
    form = event.target;

    const children = form.children;
    
    const urlQuery = new URLSearchParams({
        search: document.getElementById("search-term").value,
        search_by: document.getElementById("search-by").value,
        search_by_major: document.getElementById("search-by-major").value
    });

    window.location.href = `/student/search?${urlQuery.toString()}`;
}

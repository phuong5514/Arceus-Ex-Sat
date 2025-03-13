mode = "view";
const DEFAULT_MODE = "view";

function toggleMode(newMode) {
  if (mode != newMode) {
    mode = newMode;
  } else {
    mode = DEFAULT_MODE;
  }
  toggleButtonState();
}

function onAddStudentClicked(){
  toggleMode("add");
  const elements = document.getElementsByClassName("add");
  for (let i = 0; i < elements.length; i++) {
    changeElementDisplay(elements[i], mode === "add");
  }
}

function onEditStudentClicked(){
  toggleMode("edit");
}

function onRemoveStudentClicked(){
  toggleMode("remove");
}

function onAddStudentSaved(){
  mode = "view";
  var elements = document.getElementsByClassName("add");
  for (let i = 0; i < elements.length; i++) {
    changeElementDisplay(elements[i], false);
  }

  var student = {
    student_id: document.getElementById("add-student_id").value,
    full_name: document.getElementById("add-full_name").value,
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
}

function onAddStudentCancled(){
  mode = "view";
  var elements = document.getElementsByClassName("add");
  for (let i = 0; i < elements.length; i++) {
    changeElementDisplay(elements[i], false);
  }
}

function changeElementDisplay(element, visible){
  let visibleDisplay = "block";
  if (element.tagName === "DIV") {
    visibleDisplay = "block";
  } else if (element.tagName === "BUTTON") {
    visibleDisplay = "inline";
  } else if (element.tagName === "TR"){
    visibleDisplay = "table-row";
  } else {
    visibleDisplay = "inline";
  }
  element.style.display = visible ? visibleDisplay : "none";
}

const header_button_ids = ["header_add_student", "header_update_student", "header_remove_student"];


function toggleButtonState() {
  const buttons = header_button_ids.map(id => document.getElementById(id));
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

function toggleState(element, state) {
  if (element.classList.contains(state)) {
    element.classList.remove(state);
  } else {
    element.classList.add(state);
  }
}

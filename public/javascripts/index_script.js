mode = "view";

function onAddStudentClicked(){
  if (mode != "add") {
    mode = "add";
  } else {
    mode = "view";
  }
  const elements = document.getElementsByClassName("add");
  for (let i = 0; i < elements.length; i++) {
    changeElementDisplay(elements[i], mode === "add");
  }
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

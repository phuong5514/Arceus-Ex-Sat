import dayjs from "dayjs";

export const formatStudentsData = (students) => {
    students.forEach(student => {
        student.birthdate = dayjs(student.birthdate).format('DD/MM/YYYY');
    });
}

export default formatStudentsData;

export const formatIdentificationDocument = (document, formatTypeFunction) => {
  if (document) {
    document.issue_date = dayjs(document.issue_date).format('YYYY-MM-DD');
    document.expiry_date = dayjs(document.expiry_date).format('YYYY-MM-DD');
    document.text = formatTypeFunction(document);
  } else {
    document = null;
  }
}

export const formatAddress = (address) => {
  if (!address) {
    return "";
  }
  return Object.entries(address)
    .filter(([key, value]) => (key === "city" || key === "country") && typeof value !== "undefined" && value)
    .map(([key, value]) => value)
    .join(", ");
}

export const formatIdentityCard = (identityCard) => {
  if (!identityCard){
    return "";
  }

  return identityCard._id;
}

export const formatPassport = (passport) => {
  if (!passport){
    return "";
  }
  return passport._id;
}



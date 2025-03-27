export const importCSVGuidance = {
    "_id": "22120271",
    "name": "Dương Hoàng Hồng Phúc",
    "birthdate": "08/11/2004",
    "gender": "Nam",
    "class_year": 2022,
    "program": "Đại trà",
    "address": "TP HCM",
    "email": "phuc21744@gmail.com",
    "phone_number": "0325740149",
    "status": "Đang học", // This must be check againts the status collection
    "major": "Tiếng Anh Thương mại", // This must be check againts the majors collection

    "nationality": "Việt Nam",

    // Address id is generated from student id + ADDRPMNT + type
    "permanent_address.house_number": "123",
    "permanent_address.street": "Nguyễn Văn Cừ",
    "permanent_address.ward": "Phường 1",
    "permanent_address.district": "Quận 5",
    "permanent_address.city": "TP HCM",
    "permanent_address.country": "Việt Nam",
    "permanent_address.postal_code": "700000",

    // Address id is generated from student id + ADDRTMP + type
    "temporary_address.house_number": "456",
    "temporary_address.street": "Nguyễn Trãi",
    "temporary_address.ward": "Phường 2",
    "temporary_address.district": "Quận 5",
    "temporary_address.city": "TP HCM",
    "temporary_address.country": "Việt Nam",
    "temporary_address.postal_code": "700000",

    // Address id is generated from student id + ADDRMAIL + type
    "mailing_address.house_number": "789",
    "mailing_address.street": "Lê Lợi",
    "mailing_address.ward": "Phường 3",
    "mailing_address.district": "Quận 1",
    "mailing_address.city": "TP HCM",
    "mailing_address.country": "Việt Nam",
    "mailing_address.postal_code": "700000",

    "identity_card._id": "012345678910",
    "identity_card.issue_date": "26/05/2020",
    "identity_card.expiry_date": "26/05/2020",
    "identity_card.issue_location": "TP HCM",
    "identity_card.is_digitized": true,
    "identity_card.chip_attached": true,

    "passport._id": "C1234567",
    "passport.type": "Regular",
    "passport.country_code": "VNM",
    "passport.issue_date": "08/11/2021",
    "passport.expiry_date": "08/11/2026",
    "passport.issue_location": "TP HCM",
    "passport.notes": ""
}
  
export const importJSONGuidance = {
    "_id": "22120271",
    "name": "Dương Hoàng Hồng Phúc",
    "birthdate": "08/11/2004",
    "gender": "Nam",
    "class_year": 2022,
    "program": "Đại trà",
    "address": "TP HCM",
    "email": "phuc21744@gmail.com",
    "phone_number": "0325740149",
    "status": "Đang học",
    "major": "Tiếng Anh Thương mại",
    "nationality": "Việt Nam",
    "permanent_address": {
        "house_number": "123",
        "street": "Nguyễn Văn Cừ",
        "ward": "Phường 1",
        "district": "Quận 5",
        "city": "TP HCM",
        "country": "Việt Nam",
        "postal_code": "700000"
    },
    "temporary_address": {
        "house_number": "456",
        "street": "Nguyễn Trãi",
        "ward": "Phường 2",
        "district": "Quận 5",
        "city": "TP HCM",
        "country": "Việt Nam",
        "postal_code": "700000"
    },
    "mailing_address": {
        "house_number": "789",
        "street": "Lê Lợi",
        "ward": "Phường 3",
        "district": "Quận 1",
        "city": "TP HCM",
        "country": "Việt Nam",
        "postal_code": "700000"
    },
    "identity_card": {
        "_id": "012345678910",
        "issue_date": "26/05/2020",
        "expiry_date": "26/05/2020",
        "issue_location": "TP HCM",
        "is_digitized": true,
        "chip_attached": true
    },
    "passport": {
        "_id": "C1234567",
        "type": "Regular",
        "country_code": "VNM",
        "issue_date": "08/11/2021",
        "expiry_date": "08/11/2026",
        "issue_location": "TP HCM",
        "notes": ""
    }
}
  
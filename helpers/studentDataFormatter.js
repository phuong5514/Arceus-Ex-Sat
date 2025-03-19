

export const formatStudentsData = (students) => {
    students.forEach(student => {
        student.birthdate = dayjs(student.birthdate).format('DD/MM/YYYY');
    });
}

export default formatStudentsData;
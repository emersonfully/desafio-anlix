const patientCellTemplate = (patient) => `
    <td>${patient.cpf}</td>
    <td><a href="#" class="patient-link" data-cpf="${patient.cpf}" data-birthday="${patient.data_nasc}">${patient.nome}</a></td>
    <td>${patient.data_nasc}</td>
    <td>${patient.tipo_sanguineo}</td>
`

export default patientCellTemplate
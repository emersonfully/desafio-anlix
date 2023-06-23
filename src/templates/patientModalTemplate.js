const patientModalTemplate = (patient) => `
    <div class="pacientInformationWrapper">
        <span class="material-icons-outlined">
        medical_information
    </span>
        <span class="patientInformation">Informação sobre o Paciente</span>
    </div>
    <ul>
        <li><strong>Name:</strong> ${patient.nome}</li>
        <li><strong>CPF:</strong> ${patient.cpf}</li>
        <li><strong>RG:</strong> ${patient.rg}</li>
        <li><strong>Sexo:</strong> ${patient.sexo}</li>
        <li><strong>Idade:</strong> ${patient.idade}</li>
        <li><strong>Data de nascimento:</strong> ${patient.data_nasc}</li>
        <li><strong>Nome da Mãe:</strong> ${patient.mae}</li>
        <li><strong>Nome do Pai:</strong> ${patient.pai}</li>
        <li><strong>Email:</strong> ${patient.email}</li>
        <li><strong>Endereço:</strong> ${patient.endereco}, ${patient.numero}, ${patient.bairro}</li>
        <li><strong>Cidade:</strong> ${patient.cidade}, ${patient.estado}</li>
        <li><strong>Cep:</strong> ${patient.telefone_fixo}</li>
        <li><strong>Tel:</strong> ${patient.cep}</li>
        <li><strong>Cel:</strong> ${patient.celular}</li>
        <li><strong>Altura:</strong> ${patient.altura}</li>
        <li><strong>Peso:</strong> ${patient.peso}</li>
        <li><strong>Tipo Snaguíneo:</strong> ${patient.tipo_sanguineo}</li>
        <li><strong>Cor:</strong> ${patient.cor}</li>
    </ul>
    <button id="closeModalBtn">Close</button>
`;

export default patientModalTemplate
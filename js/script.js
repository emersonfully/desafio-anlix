// SIDEBAR TOGGLE

var sidebarOpen = false;
var sidebar = document.getElementById("sidebar");

function openSidebar() {
    if (!sidebarOpen) {
        sidebar.classList.add("sidebar-responsive");
        sidebarOpen = true;
    }
}

function closeSidebar() {
    if (sidebarOpen) {
        sidebar.classList.remove("sidebar-responsive");
        sidebarOpen = false;
    }
}

const searchInput = document.getElementById('header-searchBar')
const resultsBody = document.getElementById('resultsBody')
const pagination = document.getElementById('pagination')
const modalOverlay = document.getElementById('modalOverlay');
const modalContent = document.getElementById('modalContent');

let currentPage = 1;
const itemsPerPage = 12;

searchInput.addEventListener('input', fetchPatients)

function fetchPatients() {
    const name = searchInput.value;

    fetch(`http://localhost:3000/patients/name/${name}`)
        .then(response => response.json())
        .then(data => {
            resultsBody.innerHTML = ''

            // Calculate pagination information
            const totalItems = data.length;
            const totalPages = Math.ceil(totalItems / itemsPerPage);
            const startIndex = (currentPage - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const currentItems = data.slice(startIndex, endIndex);

            currentItems.forEach(patient => {
                const row = document.createElement('tr');

                const html = `
                    <td>${patient.cpf}</td>
                    <td><a href="#" class="patient-link" data-cpf="${patient.cpf}" data-birthday="${patient.data_nasc}">${patient.nome}</a></td>
                    <td>${patient.data_nasc}</td>
                    <td>${patient.tipo_sanguineo}</td>

                `
                row.innerHTML = html
                resultsBody.appendChild(row)
            });

            // Render pagination navigation buttons
            renderPaginationButtons(totalPages)

            // Add event listener to the parent element
            resultsBody.addEventListener('click', handlePatientLinkClick);
        })
        .catch(err => {
            console.error('Error: ', err)
        })
}

// Table Pagination

function renderPaginationButtons(totalPages) {
    pagination.innerHTML = '';

    const previousButton = document.createElement('button');
    previousButton.innerText = 'Previous';
    previousButton.disabled = currentPage === 1;
    previousButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            fetchPatients();
        }
    });
    pagination.appendChild(previousButton);

    const pageNumberSpan = document.createElement('span');
    pageNumberSpan.innerText = `Page ${currentPage} of ${totalPages || 1}`;
    pagination.appendChild(pageNumberSpan);

    const nextButton = document.createElement('button');
    nextButton.innerText = 'Next';
    nextButton.disabled = currentPage === totalPages;
    nextButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            fetchPatients();
        }
    });
    pagination.appendChild(nextButton);
}

// Modal 
function handlePatientLinkClick(event) {
    const patientLink = event.target.closest('.patient-link');
    if (patientLink) {
        event.preventDefault();

        const patientName = patientLink.textContent.trim();

        // Make a new API call to fetch patient details
        fetch(`http://localhost:3000/patients/name/${patientName}`)
            .then(response => response.json())
            .then(patients => {

                const patient = patients[0]
                // Generate the content for the modal
                const contentHtml = `
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
                    <canvas id="graphicContainer"></canvas>
                    <button id="closeModalBtn">Close</button>
                `;

                // Set the modal content
                modalContent.innerHTML = contentHtml;

                // Show the modal overlay
                modalOverlay.style.display = 'flex';

                // Add event listener to the close button
                const closeModalBtn = document.getElementById('closeModalBtn');
                closeModalBtn.addEventListener('click', closeModal);
            })
            .catch(err => {
                console.error('Error:', err);
            });
    }
}

function closeModal() {
    // Hide the modal overlay
    modalOverlay.style.display = 'none';
}


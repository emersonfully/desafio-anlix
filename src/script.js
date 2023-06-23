import { patientCellTemplate, patientModalTemplate } from './templates/index.js'

let sidebarOpen = false;
const sidebar = document.getElementById("sidebar");

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

let patientsTimeout;
let patientsData = []

function initilizeApplication() {
    fetchPatients()

    searchInput.addEventListener('input', () => {
        clearTimeout(patientsTimeout)

        patientsTimeout = setTimeout(fetchPatients, 400)
    })
}

async function fetchPatients(page = 1) {
    const name = searchInput.value;

    return fetch(`http://localhost:3000/patients/search?name=${name}&page=${page}&limit=${itemsPerPage}`)
        .then(response => response.json())
        .then(data => {
            resultsBody.innerHTML = ''

            const { patients, totalPages } = data

            patients.forEach(patient => {
                const row = document.createElement('tr');

                const contentHtml = patientCellTemplate(patient)
                row.innerHTML = contentHtml
                resultsBody.appendChild(row)
                row.addEventListener('click', () => handlePatientLinkClick(patient, row));
            });

            patientsData = [...patients]

            // Render pagination navigation buttons
            renderPaginationButtons(totalPages)
        })
        .catch(err => {
            console.error('Error: ', err)
        })
}

async function fetchHealthMetrics(cpf) {
    return fetch(`http://localhost:3000/patient/${cpf}/latest_metrics`)
        .then(response => response.json())
        .catch(err => {
            console.error('Error: ', err)
        })
}

// Table Pagination

function renderPaginationButtons(totalPages) {
    pagination.innerHTML = '';

    const previousButton = document.createElement('button');
    previousButton.innerText = 'Anterior';
    previousButton.disabled = currentPage === 1;
    previousButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            fetchPatients(currentPage);
        }
    });
    pagination.appendChild(previousButton);

    const pageNumberSpan = document.createElement('span');
    pageNumberSpan.innerText = `Página ${currentPage} de ${totalPages || 1}`;
    pagination.appendChild(pageNumberSpan);

    const nextButton = document.createElement('button');
    nextButton.innerText = 'Próximo';
    nextButton.disabled = currentPage === totalPages;
    nextButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            fetchPatients(currentPage);
        }
    });
    pagination.appendChild(nextButton);
}

// Modal 
function handlePatientLinkClick(patient) {
    const contentHtml = patientModalTemplate(patient);

    // Set the modal content
    modalContent.innerHTML = contentHtml;

    // Show the modal overlay
    modalOverlay.style.display = 'flex';

    // Add event listener to the close button
    const closeModalBtn = document.getElementById('closeModalBtn');
    closeModalBtn.addEventListener('click', closeModal);

    insertHealthData(patient, modalContent)
}

async function insertHealthData(patient, element) {
    const { cpf } = patient

    const healthData = await fetchHealthMetrics(cpf)
    const metricsTemplate = `
        <li><strong>Índice pulmonar:</strong> ${healthData.ind_pulm}</li>
        <li><strong>Índice cardíaco:</strong> ${healthData.ind_card}</li>
    `

    element.querySelector("ul").insertAdjacentHTML("beforeend", metricsTemplate)
    console.log(healthData)
}

function closeModal() {
    // Hide the modal overlay
    modalOverlay.style.display = 'none';
}

initilizeApplication()
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

searchInput.addEventListener('input', fetchPatients)

function fetchPatients() {
    const name = searchInput.value;

    fetch(`http://localhost:3000/patients/name/${name}`)
        .then(response => response.json())
        .then(data => {
            resultsBody.innerHTML = ''

            data.forEach(patient => {
                const row = document.createElement('tr');

                const html = `
                    <td>${patient.cpf}</td>
                    <td>${patient.nome}</td>
                    <td>${patient.data_nasc}</td>
                    <td>${patient.tipo_sanguineo}</td>

                `
                row.innerHTML = html
                resultsBody.appendChild(row)
            });
        })
        .catch(err => {
            console.error('Error: ', err)
        })
}
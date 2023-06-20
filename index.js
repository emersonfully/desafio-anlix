const express = require('express')
const fs = require('fs')
const bodyParser = require('body-parser')
const sqlite3 = require('sqlite3').verbose()
const app = express()
const port = 3000
const path = require('path')

app.use(bodyParser.json())

// Set up in-memory SQLite database
const db = new sqlite3.Database(':memory:');

const populateDatabase = () => {
    // Load patient data from JSON file
    const patientsData = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'dados', 'pacientes.json'), 'utf8'));

    // Insert patient data into the patients table
    patientsData.forEach(patient => {
        const sql = 'INSERT INTO patients (cpf, nome, idade, rg, data_nasc, sexo, signo, mae, pai, email, senha, cep, endereco, numero, bairro, cidade, estado, telefone_fixo, celular, altura, peso, tipo_sanguineo, cor) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
        const params = [patient.cpf, patient.nome, patient.idade, patient.rg, patient.data_nasc, patient.sexo, patient.signo, patient.mae, patient.pai, patient.email, patient.senha, patient.cep, patient.endereco, patient.numero, patient.bairro, patient.cidade, patient.estado, patient.telefone_fixo, patient.celular, patient.altura, patient.peso, patient.tipo_sanguineo, patient.cor];
        db.run(sql, params, (err) => {
            if (err) console.error('Error inserting patient:', err);
        });
    });

    // Folders for the health metric files
    const metricFolders = ['indice_cardiaco', 'indice_pulmonar'];

    metricFolders.forEach(folder => {
        const metricType = folder === 'indice_cardiaco' ? 'ind_card' : 'ind_pulm';
        const fileNamesPath = path.resolve(__dirname, 'dados', folder)

        const fileNames = fs.readdirSync(fileNamesPath);

        fileNames.forEach(fileName => {
            const filePath = path.resolve(__dirname, 'dados', folder, fileName)
            const data = fs.readFileSync(filePath, 'utf8')
                .split('\n')
                .slice(1)
                .map(line => line.split(/\s+|\r/).filter(part => part !== ''))
                .filter(parts => {
                    return parts.length === 3
                });
            data.forEach(([cpf, epoch, value]) => {
                const sql = `INSERT INTO health_data (cpf, epoch, ${metricType}) VALUES (?, ?, ?)`;
                db.run(sql, [cpf, epoch, value], (err) => {
                    if (err) console.error(`Error inserting ${metricType} data:`, err);
                });
            });
        });
    });
};

db.serialize(() => {
    db.run("CREATE TABLE patients (cpf TEXT PRIMARY KEY, nome TEXT, idade INTEGER, rg TEXT, data_nasc TEXT, sexo TEXT, signo TEXT, mae TEXT, pai TEXT, email TEXT, senha TEXT, cep TEXT, endereco TEXT, numero INTEGER, bairro TEXT, cidade TEXT, estado TEXT, telefone_fixo TEXT, celular TEXT, altura TEXT, peso INTEGER, tipo_sanguineo TEXT, cor TEXT)");
    db.run("CREATE TABLE health_data (id INTEGER PRIMARY KEY, cpf TEXT, epoch INTEGER, ind_card REAL, ind_pulm REAL)");
});

populateDatabase()


app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`)
})
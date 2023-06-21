const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const port = 3000;
const path = require('path');

app.use(bodyParser.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

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

// Define your endpoints here

// Endpoint 1: Get the latest value of a health metric (cardiac or pulmonary) for a specific patient
app.get('/patient/:cpf/health_metric/:metric', (req, res) => {
    const { cpf, metric } = req.params;
    const sql = `SELECT ${metric} FROM health_data WHERE cpf = ? ORDER BY epoch DESC LIMIT 1`;
    db.get(sql, [cpf], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        return res.json(row);
    });
});

// Endpoint 2: Get the latest values of all health metrics for a specific patient
app.get('/patient/:cpf/latest_metrics', (req, res) => {
    const { cpf } = req.params;
    const sql = "SELECT * FROM health_data WHERE cpf = ? ORDER BY epoch DESC LIMIT 1"
    db.get(sql, [cpf], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message })
        }
        return res.json(row);
    });
});

// Endpoint 3: get all health metrics for all patients on a specific date
app.get('/data/:date', (req, res) => {
    const { date } = req.params;
    const sql = "SELECT * FROM health_data WHERE date(epoch, 'unixepoch') = ?";
    db.all(sql, [date], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message })
        }
        return res.json(rows);
    });
});

// Endpoint 4: get a specific health metric for a patient within a date range
app.get('/patient/:cpf/health_metric/:metric/range/:start/:end', (req, res) => {
    const { cpf, metric, start, end } = req.params;
    const sql = `SELECT ${metric} FROM health_data WHERE cpf = ? AND date(epoch, 'unixepoch') BETWEEN ? AND ? ORDER BY epoch`;
    db.all(sql, [cpf, start, end], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        return res.json(rows);
    });
});

// Endpoint 5: get the latest value of a health metric for a patient within a value range 
app.get('/patient/:cpf/health_metric/:metric/value-range/:min/:max', (req, res) => {
    const { cpf, metric, min, max } = req.params;
    const sql = `SELECT ${metric} FROM health_data WHERE cpf = ? AND ${metric} BETWEEN ? AND ? ORDER BY epoch DESC LIMIT 1`;
    db.get(sql, [cpf, min, max], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        return res.json(row);
    });
});

// Endpoint 6: Get patients with a name or partial name
app.get('/patients/name/:name', (req, res) => {
    const { name } = req.params;
    const sql = "SELECT * FROM patients WHERE nome LIKE ?";
    db.all(sql, [`%${name}%`], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        return res.json(rows);
    });
});


// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`)
})
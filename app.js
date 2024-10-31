const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

// Configuração do EJS como motor de visualização
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Configuração do multer para salvar arquivos na pasta 'files/userid'
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join('./files');
    if (!fs.existsSync(dir)){
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const randomName = Math.random().toString(36).substring(2, 14);
    cb(null, randomName + "-" + file.originalname);
  }
});

// Limite cada upload a 50mb
const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuração do diretório público para arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));
app.use('/files', express.static(path.join(__dirname, 'files')));

app.get('/', (req, res) => {
  res.render('index', { message: 'Olá, mundo!' });
});

app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Nenhum arquivo enviado' });
  }
  const id = req.file.filename.split('-')[0]; // Obtém o randomName (ID)
  res.status(200).json({ message: 'Arquivo recebido e salvo com sucesso!', id });
});

app.get('/f/:id', (req, res) => {
  const id = req.params.id;
  const filesDir = path.join(__dirname, 'files');
  const files = fs.readdirSync(filesDir);
  const file = files.find(f => f.startsWith(id + '-'));

  if (file) {
    const fileType = path.extname(file).substring(1); // Obtém a extensão do arquivo sem o ponto
    res.render('files', { filePath: file, fileType });
  } else {
    res.status(404).json({ error: 'Arquivo não encontrado' });
  }
});

// Middleware de tratamento de erros do multer
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: 'Arquivo excede o limite de 50MB' });
    }
    return res.status(400).json({ error: err.message });
  } else if (err) {
    return res.status(500).json({ error: 'Erro no servidor' });
  }
  next();
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
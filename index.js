const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

// Inicializar la aplicación y los módulos
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Cola en memoria para los mensajes
const messageQueue = [];

// Manejar conexión de clientes
io.on('connection', (socket) => {
    console.log('Un usuario se ha conectado');

    // Recibir mensaje del cliente y agregarlo a la cola
    socket.on('sendMessage', (msg) => {
        console.log(`Mensaje recibido: ${msg}`);
        messageQueue.push({ msg, timestamp: Date.now() }); // Agregar mensaje con marca de tiempo
        processQueue(); // Procesar la cola después de agregar el mensaje
    });

    // Enviar mensajes anteriores al nuevo cliente (si es necesario)
    socket.emit('previousMessages', messageQueue);

    socket.on('disconnect', () => {
        console.log('Un usuario se ha desconectado');
    });
});

// Procesar la cola de mensajes
const processQueue = () => {
    while (messageQueue.length) {
        const { msg, timestamp } = messageQueue.shift(); // Extraer el primer mensaje
        io.emit('message', { msg, timestamp }); // Reenviar a todos los clientes
    }
};

// Ruta de prueba
app.get('/', (req, res) => {
    res.send('Servidor funcionando correctamente');
});

// Configuración del servidor
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});

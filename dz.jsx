const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const React = require('react');
const { renderToString } = require('react-dom/server');
const { useState, useEffect } = require('react');


const app = express();
const server = http.createServer(app);
const io = socketIo(server);


const ChatApp = () => {
    const [newName, setNewName] = useState('');
    const [names, setNames] = useState([]);

    useEffect(() => {
        const socket = io();

        socket.on('user_change_name', (name) => {
            setNames((prevNames) => [...prevNames, name]);
        });

        return () => {
            socket.off('user_change_name'); 
        };
    }, []);

    const changeName = () => {
        if (newName) {
            socket.emit('user_change_name', newName);
            setNewName('');
        }
    };

    return (
        <div>
            <h1>Socket.IO Chat</h1>
            <div>
                <input
                    type="text"
                    placeholder="Введите новое имя"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                />
                <button onClick={changeName}>Изменить имя</button>
            </div>
            <h2>Имя пользователей:</h2>
            <ul>
                {names.map((name, index) => (
                    <li key={index}>{name}</li>
                ))}
            </ul>
        </div>
    );
};

app.get('/', (req, res) => {
    const html = renderToString(<ChatApp />);
    res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Socket.IO Chat</title>
        <script src="/socket.io/socket.io.js"></script>
        <script>
            const socket = io();
        </script>
    </head>
    <body>
        <div id="root">${html}</div>
        <script src="https://unpkg.com/react/umd/react.development.js"></script>
        <script src="https://unpkg.com/react-dom/umd/react-dom.development.js"></script>
        <script>
            ReactDOM.hydrate(
                <ChatApp />,
                document.getElementById('root')
            );
        </script>
    </body>
    </html>
  `);
});


io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('user_change_name', (newName) => {
        io.emit('user_change_name', newName); 
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

server.listen(4000, () => {
    console.log('Server is running on http://localhost:4000');
});

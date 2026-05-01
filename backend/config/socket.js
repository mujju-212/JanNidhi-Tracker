const initializeSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on('join_auditor_room', () => {
      socket.join('auditor_room');
      console.log('Auditor joined auditor_room');
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};

const emitToAuditors = (io, event, data) => {
  io.to('auditor_room').emit(event, data);
};

module.exports = { initializeSocket, emitToAuditors };

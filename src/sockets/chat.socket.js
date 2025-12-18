module.exports = (io, socket) => {
    socket.on('send_message', ({ receiverId, message }) => {
        io.to(receiverId).emit('receive_message', {
            senderId: socket.user.id,
            message
        });
    });
};
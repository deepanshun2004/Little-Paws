let ioInstance = null;

function setIo(io) {
  ioInstance = io;
}

function getIo() {
  return ioInstance;
}

function emitToRoom(room, event, payload) {
  if (!ioInstance || !room) {
    return;
  }

  ioInstance.to(room).emit(event, payload);
}

function emitToUser(userId, event, payload) {
  if (!userId) {
    return;
  }

  emitToRoom(`user:${userId}`, event, payload);
}

function emitToRole(role, event, payload) {
  if (!role) {
    return;
  }

  emitToRoom(`role:${role}`, event, payload);
}

module.exports = {
  setIo,
  getIo,
  emitToRoom,
  emitToUser,
  emitToRole,
};

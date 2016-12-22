var exports = module.exports;
/**
 * Invoked upon successfully initializing the server-side socket
 * @return {emit} Emit information back to all connected clients.
 */
exports.setChatSocket = (io) => {

  //ZKH - Socket-io Connection
  io.on('connection', function (socket) {
    //ZKH - Perform Chat Logic Here
  });
};


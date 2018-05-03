export const makeHandler = send => (command, payload = {}) => () =>
  send(command)(payload);
export const logMachineChange = state => console.log("State changed!", state);

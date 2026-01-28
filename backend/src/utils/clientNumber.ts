//genera un número random de 6 digitos para el cliente
export const generateClientNumber = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

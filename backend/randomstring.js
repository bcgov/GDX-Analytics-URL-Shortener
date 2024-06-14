// randomstring.js
// This function generates a random string of a defined character set with a specified length
export const generateRandomString = length => {
  
  // Check if the input is a positive number
  if (typeof length !== 'number' || length <= 0) {
    throw new Error('Length must be a positive number');
  }

  // Characters to use in the generated string
  const characters = '23456789'; 
  
  let result = '';

  // Loop through to create a random string of the specified length
  for (let i = 0; i < length; i++) {
    result += characters[Math.floor(Math.random() * characters.length)];
  }

  return result;
};

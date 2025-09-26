// export const userName = () => (Math.random().toString(36).slice(-8))

export const userName = () => {
  const consonants = 'bcdfghjklmnpqrstvwxyz';
  const vowels = 'aeiou';
  const getRandomChar = (str) => str[Math.floor(Math.random() * str.length)];
  const word = 
    getRandomChar(consonants) + 
    getRandomChar(vowels) + 
    getRandomChar(consonants) + 
    getRandomChar(vowels);
  const numbers = Math.floor(1000 + Math.random() * 9000); // 4-digit number
  return `${word}${numbers}`;
};
// export const tempPassword = () =>( Math.random().toString(36).slice(-8))
export const tempPassword = () => {
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const digits = '0123456789';
  const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  const allChars = lower + upper + digits + special;

  // Helper to get a random character from a string
  const getRandomChar = (str) => str[Math.floor(Math.random() * str.length)];

  // Ensure at least one character from each category
  let password = [
    getRandomChar(lower),
    getRandomChar(upper),
    getRandomChar(digits),
    getRandomChar(special)
  ];

  // Fill the remaining 8 characters
  for (let i = 0; i < 4; i++) {
    password.push(getRandomChar(allChars));
  }

  // Shuffle the password array to randomize character positions
  for (let i = password.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [password[i], password[j]] = [password[j], password[i]];
  }

  return password.join('');
};
function generateAccountNumber() {
  const prefix = "30";
  const randomDigits = Math.floor(10000000 + Math.random() * 90000000);
  return `${prefix}${randomDigits}`;
}

module.exports = generateAccountNumber;
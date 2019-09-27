
module.exports = (keys) => {
  for (let i = 0; i < keys.length; i++) {
    if(typeof keys[i] === 'string') {
      keys[i] = `'${keys[i]}'`;
    }

    if(keys[i] === null) {
      keys[i] = 'NULL';
    }
  }
  return keys;
}
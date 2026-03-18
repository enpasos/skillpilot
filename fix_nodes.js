const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// Fix 5a9702f4-7e4d-457d-b98c-f0bafcd1e386 requires 3e4032bd-4d8c-4e72-bfdd-64a34df053c9
const node = data.goals.find(g => g.id === '5a9702f4-7e4d-457d-b98c-f0bafcd1e386');
if (node && node.requires) {
  node.requires = node.requires.filter(id => id !== '3e4032bd-4d8c-4e72-bfdd-64a34df053c9');
}

fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
console.log('Fixed APV-102 error.');

const test = require('node:test');
const assert = require('node:assert/strict');

function escapeHtml(text){
  if(!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const availableColors = ['yellow', 'pink', 'blue', 'green'];
const colorHexMap = { yellow: '#fff59d', pink: '#f8c8dc', blue: '#cfe8ff', green: '#d8f5d0' };
const colorRgbMap = {
  yellow: [255, 245, 157],
  pink: [248, 200, 220],
  blue: [207, 232, 255],
  green: [216, 245, 208]
};

test('escapeHtml correctly sanitizes special characters', () => {
  assert.equal(escapeHtml('<script>alert("xss")</script>'), '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
  assert.equal(escapeHtml("It's a & b"), 'It&#39;s a &amp; b');
  assert.equal(escapeHtml(''), '');
  assert.equal(escapeHtml(null), '');
});

test('cycle color cycles through available colors correctly', () => {
  const getNextColor = (current) => {
    const index = availableColors.indexOf(current || 'yellow');
    return availableColors[(index + 1) % availableColors.length];
  };

  assert.equal(getNextColor('yellow'), 'pink');
  assert.equal(getNextColor('pink'), 'blue');
  assert.equal(getNextColor('blue'), 'green');
  assert.equal(getNextColor('green'), 'yellow');
  assert.equal(getNextColor('unknown'), 'pink');
});

test('all colors have corresponding hex and RGB values', () => {
  for (const color of availableColors) {
    assert.ok(colorHexMap[color], `Missing hex for ${color}`);
    assert.ok(Array.isArray(colorRgbMap[color]), `Missing RGB for ${color}`);
    assert.equal(colorRgbMap[color].length, 3, `RGB for ${color} must have 3 components`);
  }
});

test('note search filtering matches case-insensitively', () => {
  const notes = [
    { id: 1, text: 'Buy milk and eggs', color: 'yellow' },
    { id: 2, text: 'Schedule dentist appointment', color: 'pink' },
    { id: 3, text: 'Dentist follow-up notes', color: 'blue' }
  ];

  const filterNotes = (query) => {
    const q = (query || '').toLowerCase().trim();
    return q ? notes.filter(n => (n.text || '').toLowerCase().includes(q)) : notes;
  };

  assert.equal(filterNotes('dentist').length, 2);
  assert.equal(filterNotes('MILK').length, 1);
  assert.equal(filterNotes('notfound').length, 0);
  assert.equal(filterNotes('').length, 3);
});

test('adding a note truncates to maximum capacity', () => {
  let notes = [];
  for (let i = 0; i < 55; i++) {
    notes.unshift({ id: i, text: `Note ${i}`, color: 'yellow' });
    notes = notes.slice(0, 50);
  }
  assert.equal(notes.length, 50);
  assert.equal(notes[0].id, 54);
});

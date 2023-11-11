
let random = {
  from: arr => arr[ ~~(Math.random() * arr.length) ],
  range: (min, max) => Math.round(min - .5 + Math.random() * (max - min + 1)),
};

export default random;

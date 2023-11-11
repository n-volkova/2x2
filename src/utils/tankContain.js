function contain(sprite, points) {
  let collision = undefined;

  if (sprite.x < points[0].x) {
    sprite.x = points[0].x;
    collision = 'first left';
  }

  if (Math.abs(points[1].y - sprite.y) < 5 && sprite.x < points[1].x) {
    sprite.y = points[0].y;
    collision = 'first top';
  }
  if (Math.abs(points[1].x - sprite.x) < 5 && sprite.x + sprite.width < points[15].x && sprite.y < points[1].y && sprite.y >= points[2].y) {
    sprite.x = points[1].x;
    collision = 'second left';
  }

  if (sprite.y > points[0].y && sprite.x < points[1].x) {
    sprite.y = points[0].y;
    collision = 'first bottom';
  }

  if (sprite.y + sprite.height > points[16].y) {
    sprite.y = points[16].y - sprite.height;
    collision = 'first bottom';
  }

  // second zone
  if (sprite.x + sprite.width > points[16].x && sprite.y > points[2].y) {
    if (sprite.y + sprite.height > points[15].y && sprite.x > points[15].x) {
      sprite.y = points[15].y - sprite.height;
      collision = 'third bottom';
    } else {
      sprite.x = points[16].x - sprite.width;
      collision = 'second right';
    }
  }

  if (sprite.y < points[2].y && sprite.x < points[3].x && sprite.y + sprite.height > points[4].y) {
    if (points[3].x - sprite.x < 5) {
      sprite.x = points[3].x;
      collision = 'fourth left';
    } else if (points[2].y - sprite.y < 5 && points[6].x < sprite.x) {
      sprite.y = points[2].y;
      collision = 'second top';
    }
  }

  // third zone
  if (sprite.x + sprite.width > points[14].x) {
    sprite.x = points[14].x - sprite.width;
    collision = 'third right';
  }
    
  // fourth zone
  if (points[12].y - sprite.y < 5 && sprite.y < points[13].y && sprite.x + sprite.width > points[12].x) {
    sprite.y = points[13].y;
    collision = 'fourth top';
  }
  // fifth zone
  if (sprite.y < points[8].y && sprite.x < points[8].x) {
    sprite.x = points[8].x;
    collision = 'fifth left';
  }
  if (Math.abs(points[5].y - sprite.y - sprite.height) < 5 && Math.abs(sprite.y - points[12].y) > 5 && sprite.x + sprite.width > points[5].x && sprite.x < points[4].x) {
    sprite.y = points[5].y - sprite.height - 5;
    collision = 'fifth bottom';
  }
  // sixth zone
  if (sprite.y < points[10].y) {
    sprite.y = points[10].y;
    collision = 'sixth top';
  }
  if (points[12].y - sprite.y > 5 && sprite.x + sprite.width > points[11].x) {
    sprite.x = points[11].x - sprite.width;
    collision = 'sixth right';
  }
  if (points[12].y - sprite.y > 5 && points[9].x - sprite.x < 5 && sprite.x + sprite.width < points[11].x) {
    sprite.x = points[9].x + 5;
    collision = 'sixth left';
  }
  // seventh zone
  if (points[12].y - sprite.y < 5 && sprite.y < points[13].y && sprite.x < points[9].x) {
    sprite.y = points[13].y;
    collision = 'seventh top';
  }
  // eighth zone
  if (sprite.y + sprite.height <= points[6].y && sprite.y + sprite.height > points[5].y && sprite.x + sprite.width < points[2].x && sprite.x + sprite.width > points[5].x) {
    sprite.x = points[5].x - sprite.width;
    collision = 'eighth right';
  }
  if (Math.abs(sprite.y + sprite.height - points[6].y) <= 5 && sprite.x + sprite.width < points[6].x) {
    sprite.y = points[6].y - sprite.height - 5;
    collision = 'eighth bottom';
  }
  return collision;
}

export default contain;
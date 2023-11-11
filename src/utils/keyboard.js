function keyboard(value) {
  let key = {};
  key.value = value;
  key.isDown = false;
  key.isUp = true;
  key.press = undefined;
  key.release = undefined;
  //The `downHandler`
  key.downHandler = event => {
    if (event.code === key.value) {
      if (key.isUp && key.press) key.press(event);
      key.isDown = true;
      key.isUp = false;
      event.preventDefault();
      event.stopPropagation();
    }
  };

  //The `upHandler`
  key.upHandler = event => {
    if (event.code === key.value) {
      if (key.isDown && key.release) key.release(event);
      key.isDown = false;
      key.isUp = true;
      event.preventDefault();
      event.stopPropagation();
    }
  };

  //Attach event listeners
  const downListener = key.downHandler.bind(key);
  const upListener = key.upHandler.bind(key);

  // Attach event listeners
  key.subscribe = () => {
    window.addEventListener(
      'keydown', downListener, false
    );
    window.addEventListener(
      'keyup', upListener, false
    );
  };
    
  key.subscribe();

  // Detach event listeners
  key.unsubscribe = () => {
    window.removeEventListener('keydown', downListener);
    window.removeEventListener('keyup', upListener);
  };
  return key;
}
export default keyboard;
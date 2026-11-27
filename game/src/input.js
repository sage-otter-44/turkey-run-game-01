// Gobble Dash — keyboard and mouse input, one object the game polls each frame.

export class Input {
  constructor(canvas) {
    this.left = false;
    this.right = false;
    this.jump = false; // held
    this.jumpPressed = false; // edge, consumed by the game
    this.sprint = false;
    this.hidePressed = false; // edge
    this.anyPressed = false; // edge, any key (wakes audio, starts from menus)
    this.mouse = { x: 0, y: 0, clicked: false };
    this._keys = new Set();
    this._onKeyDown = (e) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(e.key)) e.preventDefault();
      if (!e.repeat) {
        this.anyPressed = true;
        if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') this.jumpPressed = true;
        if (e.key === 'h' || e.key === 'H') this.hidePressed = true;
      }
      this._keys.add(e.key.length === 1 ? e.key.toLowerCase() : e.key);
      this._recompute();
    };
    this._onKeyUp = (e) => {
      this._keys.delete(e.key.length === 1 ? e.key.toLowerCase() : e.key);
      this._recompute();
    };
    this._onMouseMove = (e) => {
      const r = canvas.getBoundingClientRect();
      this.mouse.x = ((e.clientX - r.left) / r.width) * canvas.width;
      this.mouse.y = ((e.clientY - r.top) / r.height) * canvas.height;
    };
    this._onMouseDown = (e) => {
      this._onMouseMove(e);
      this.mouse.clicked = true;
      this.anyPressed = true;
    };
    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);
    canvas.addEventListener('mousemove', this._onMouseMove);
    canvas.addEventListener('mousedown', this._onMouseDown);
  }

  _recompute() {
    const k = this._keys;
    this.left = k.has('ArrowLeft') || k.has('a');
    this.right = k.has('ArrowRight') || k.has('d');
    this.jump = k.has(' ') || k.has('ArrowUp') || k.has('w');
    this.sprint = k.has('Shift');
  }

  // Call at the end of each frame: edges live for exactly one frame.
  endFrame() {
    this.jumpPressed = false;
    this.hidePressed = false;
    this.anyPressed = false;
    this.mouse.clicked = false;
  }
}

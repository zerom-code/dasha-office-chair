// Safari can ignore viewport zoom limits. Cancel native touch gestures and
// activate menu buttons explicitly; driving continues through Pointer Events.
export function lockTouchViewport() {
  let tap = null;
  const options = { capture: true, passive: false };
  const cancel = (event) => {
    if (event.cancelable) event.preventDefault();
  };
  document.addEventListener(
    "touchstart",
    (event) => {
      cancel(event);
      if (event.touches.length !== 1) {
        tap = null;
        return;
      }
      const touch = event.touches[0],
        button = event.target.closest?.("button");
      tap =
        button && !button.disabled && !button.classList.contains("foot-button")
          ? {
              id: touch.identifier,
              button,
              x: touch.clientX,
              y: touch.clientY,
              moved: false,
            }
          : null;
    },
    options,
  );
  document.addEventListener(
    "touchmove",
    (event) => {
      cancel(event);
      if (!tap) return;
      const touch = [...event.touches].find((t) => t.identifier === tap.id);
      if (
        !touch ||
        Math.hypot(touch.clientX - tap.x, touch.clientY - tap.y) > 12
      )
        tap.moved = true;
    },
    options,
  );
  document.addEventListener(
    "touchend",
    (event) => {
      cancel(event);
      if (event.touches.length) return;
      const completed = tap;
      tap = null;
      if (
        !completed ||
        completed.moved ||
        !completed.button.isConnected ||
        completed.button.disabled
      )
        return;
      const touch = [...event.changedTouches].find(
        (t) => t.identifier === completed.id,
      );
      if (
        touch &&
        document
          .elementFromPoint(touch.clientX, touch.clientY)
          ?.closest("button") === completed.button
      ) {
        completed.button.click();
      }
    },
    options,
  );
  document.addEventListener(
    "touchcancel",
    (event) => {
      cancel(event);
      tap = null;
    },
    options,
  );
  for (const name of ["gesturestart", "gesturechange", "gestureend"]) {
    document.addEventListener(
      name,
      (event) => {
        cancel(event);
        tap = null;
      },
      options,
    );
  }
  document.addEventListener("dblclick", cancel, options);
}

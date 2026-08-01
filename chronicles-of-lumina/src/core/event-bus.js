// core/event-bus.js — pub/sub. The only coupling between systems and UI.

/**
 * Callback invoked by the bus when an event is emitted.
 * @callback EventListener
 * @param {*} payload — whatever the emitter passed to `emit()`.
 * @returns {void}
 */

/**
 * Unsubscribe handle returned by {@link EventBus#on}.
 * Calling it removes the listener from the bus.
 * @callback Unsubscribe
 * @returns {void}
 */

export class EventBus {
  constructor() { this.listeners = new Map(); }

  /**
   * Subscribe a listener to an event.
   * @param {string} event — event name (see core/constants.js → EVENTS).
   * @param {EventListener} fn — invoked with the payload on every emit.
   * @returns {Unsubscribe} — call to remove the listener.
   */
  on(event, fn) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event).add(fn);
    return () => this.off(event, fn);
  }

  /**
   * Remove a specific listener for an event. No-op if it wasn't subscribed.
   * @param {string} event
   * @param {EventListener} fn
   * @returns {void}
   */
  off(event, fn) { this.listeners.get(event)?.delete(fn); }

  /**
   * Broadcast an event to all subscribed listeners. Listener errors are
   * caught and logged to the console — one bad listener doesn't break the bus.
   * @param {string} event
   * @param {*} [payload]
   * @returns {void}
   */
  emit(event, payload) {
    const set = this.listeners.get(event);
    if (!set) return;
    for (const fn of set) {
      try { fn(payload); } catch (err) { console.error(`[bus] ${event}`, err); }
    }
  }

  /** Remove every listener across every event. */
  clear() { this.listeners.clear(); }
}

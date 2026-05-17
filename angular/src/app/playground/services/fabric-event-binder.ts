/**
 * Small adapter that owns Fabric (and matching native DOM) event subscriptions
 * for a single consumer. Each `bind(...)` stores the handler reference so the
 * adapter can later call the matching `off(...)` / `removeEventListener(...)`
 * during `destroy()`, removing the per-event handler bookkeeping that would
 * otherwise live on the consuming component.
 */
import type * as fabric from 'fabric';
import type { CanvasEvents } from 'fabric';

type FabricCanvas = fabric.Canvas;

interface FabricSubscription {
  kind: 'fabric';
  canvas: FabricCanvas;
  event: string;
  handler: (...args: any[]) => void;
}

interface NativeSubscription {
  kind: 'native';
  target: EventTarget;
  event: string;
  handler: (event: any) => void;
}

type Subscription = FabricSubscription | NativeSubscription;

export interface Disposable {
  dispose(): void;
}

export class FabricEventBinder {
  private subscriptions: Subscription[] = [];

  /**
   * Subscribe to a Fabric canvas event. Returns a disposable that removes just
   * this subscription, but most callers can rely on `destroy()` to clean up
   * everything at once. Generic over Fabric v6's `CanvasEvents` map so the
   * handler argument is inferred from the event name.
   */
  public bind<E extends keyof CanvasEvents>(
    canvas: FabricCanvas,
    event: E,
    handler: (e: CanvasEvents[E]) => void,
  ): Disposable {
    canvas.on(event, handler);
    const subscription: FabricSubscription = { kind: 'fabric', canvas, event: event as string, handler: handler as (...args: any[]) => void };
    this.subscriptions.push(subscription);
    return { dispose: () => this.dispose_one(subscription) };
  }

  /**
   * Subscribe to a native DOM event (e.g. on `canvas.upperCanvasEl`). Mirrors
   * `bind(...)` so consumers do not need to mix two cleanup styles. Generic
   * over `HTMLElementEventMap` so the handler argument is inferred from the
   * event name.
   */
  public bind_native<K extends keyof HTMLElementEventMap>(
    target: EventTarget,
    event: K,
    handler: (e: HTMLElementEventMap[K]) => void,
  ): Disposable {
    target.addEventListener(event, handler as EventListener);
    const subscription: NativeSubscription = { kind: 'native', target, event, handler: handler as (event: any) => void };
    this.subscriptions.push(subscription);
    return { dispose: () => this.dispose_one(subscription) };
  }

  /**
   * Removes every subscription previously registered through this binder.
   */
  public destroy(): void {
    const pending = this.subscriptions;
    this.subscriptions = [];
    for (const subscription of pending) {
      this.detach(subscription);
    }
  }

  /**
   * Alias for `destroy()` for callers that prefer the "dispose_all" name.
   */
  public dispose_all(): void {
    this.destroy();
  }

  private dispose_one(subscription: Subscription): void {
    const index = this.subscriptions.indexOf(subscription);
    if (index === -1) return;
    this.subscriptions.splice(index, 1);
    this.detach(subscription);
  }

  private detach(subscription: Subscription): void {
    if (subscription.kind === 'fabric') {
      subscription.canvas?.off(subscription.event as keyof CanvasEvents, subscription.handler);
    } else {
      subscription.target?.removeEventListener(subscription.event, subscription.handler);
    }
  }
}

// Basic polyfills for node:util
export const util = {
  inherits(ctor: unknown, superCtor: unknown) {
    (ctor as { super_: unknown; prototype: unknown }).super_ = superCtor;
    (ctor as { prototype: unknown }).prototype = Object.create((superCtor as { prototype: object }).prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true,
      },
    });
  },
};

(window as unknown as { util: typeof util }).util = util; 
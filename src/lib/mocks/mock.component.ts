import { Component, EventEmitter } from '@angular/core';

export function MockComponent(options: Component): Component {

  const metadata: Component = {
    selector: options.selector,
    template: options.template || '',
    inputs: options.inputs,
    outputs: options.outputs || [],
    exportAs: options.exportAs || '',
    providers: options.providers || []
  };

  class Mock {}

  metadata.outputs.forEach(method => {
    Mock.prototype[method] = new EventEmitter<any>();
  });

  return Component(metadata)(Mock as any);
}

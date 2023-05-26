import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { TailwindElement } from '../shared/tailwind.element';

import style from './tree.scss?inline';

@customElement('cf-tree')
export default class CfTree extends TailwindElement(style) {
  render() {
    return html`
      <ul>
        <slot></slot>
      </ul>
    `;
  }
}

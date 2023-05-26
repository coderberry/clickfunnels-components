import { html } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { live } from 'lit/directives/live.js';
import { when } from 'lit/directives/when.js';
import { TailwindElement } from '../shared/tailwind.element';

import style from './tree-item.scss?inline';

@customElement('cf-tree-item')
export default class CfTreeItem extends TailwindElement(style) {
  static isTreeItem(node: Node) {
    return node instanceof Element && node.getAttribute('role') === 'treeitem';
  }

  /** Expands the tree item. */
  @property({ type: Boolean, reflect: true }) expanded = false;

  /** Draws the tree item in a selected state. */
  @property({ type: Boolean, reflect: true }) selected = false;

  /** Disables the tree item. */
  @property({ type: Boolean, reflect: true }) disabled = false;

  /** Enables lazy loading behavior. */
  @property({ type: Boolean, reflect: true }) lazy = false;

  @state() indeterminate = false;
  @state() isLeaf = false;
  @state() loading = false;
  @state() selectable = false;

  @query('slot:not([name])') defaultSlot: HTMLSlotElement;
  @query('slot[name=children]') childrenSlot: HTMLSlotElement;
  @query('.tree-item__item') itemElement: HTMLDivElement;
  @query('.tree-item__children') childrenContainer: HTMLDivElement;
  @query('.tree-item__expand-button slot') expandButtonSlot: HTMLSlotElement;

  connectedCallback() {
    super.connectedCallback();

    this.setAttribute('role', 'treeitem');
    this.setAttribute('tabindex', '-1');

    if (this.isNestedItem()) {
      this.slot = 'children';
    }
  }

  /** Gets all the nested tree items in this node. */
  getChildrenItems({ includeDisabled = true }: { includeDisabled?: boolean } = {}): CfTreeItem[] {
    return this.childrenSlot
      ? ([...this.childrenSlot.assignedElements({ flatten: true })].filter(
          (item: CfTreeItem) => CfTreeItem.isTreeItem(item) && (includeDisabled || !item.disabled)
        ) as CfTreeItem[])
      : [];
  }

  private handleChildrenSlotChange() {
    this.loading = false;
    this.isLeaf = !this.lazy && this.getChildrenItems().length === 0;
  }

  // Checks whether the item is nested into an item
  private isNestedItem(): boolean {
    const parent = this.parentElement;
    return !!parent && CfTreeItem.isTreeItem(parent);
  }

  render() {
    const showExpandButton = !this.loading && (!this.isLeaf || this.lazy);

    return html`
      <div
        part="base"
        class="${classMap({
          'tree-item': true,
          'tree-item--expanded': this.expanded,
          'tree-item--selected': this.selected,
          'tree-item--disabled': this.disabled,
          'tree-item--leaf': this.isLeaf,
          'tree-item--has-expand-button': showExpandButton
        })}"
      >
        <div
          class="tree-item__item"
          part="
            item
            ${this.disabled ? 'item--disabled' : ''}
            ${this.expanded ? 'item--expanded' : ''}
            ${this.indeterminate ? 'item--indeterminate' : ''}
            ${this.selected ? 'item--selected' : ''}
          "
        >
          <div class="tree-item__indentation" part="indentation"></div>

          <div
            part="expand-button"
            class=${classMap({
              'tree-item__expand-button': true,
              'tree-item__expand-button--visible': showExpandButton
            })}
            aria-hidden="true"
          >
            ${when(this.loading, () => html` <span>Loading...</span> `)}
            <slot class="tree-item__expand-icon-slot" name="expand-icon">
              <i class="tree-item__expand-icon"></i>
            </slot>
            <slot class="tree-item__expand-icon-slot" name="collapse-icon">
              <i class="tree-item__collapse-icon"></i>
            </slot>
          </div>

          ${when(
            this.selectable,
            () =>
              html`
                <sl-checkbox
                  part="checkbox"
                  exportparts="
                    base:checkbox__base,
                    control:checkbox__control,
                    control--checked:checkbox__control--checked,
                    control--indeterminate:checkbox__control--indeterminate,
                    checked-icon:checkbox__checked-icon,
                    indeterminate-icon:checkbox__indeterminate-icon,
                    label:checkbox__label
                  "
                  class="tree-item__checkbox"
                  ?disabled="${this.disabled}"
                  ?checked="${live(this.selected)}"
                  ?indeterminate="${this.indeterminate}"
                  tabindex="-1"
                ></sl-checkbox>
              `
          )}

          <slot class="tree-item__label" part="label"></slot>
        </div>

        <slot
          name="children"
          class="tree-item__children"
          part="children"
          role="group"
          @slotchange="${this.handleChildrenSlotChange}"
        ></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'cf-tree-item': CfTreeItem;
  }
}

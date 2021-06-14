/*
Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import {
    html,
    property,
    CSSResultArray,
    TemplateResult,
    PropertyValues,
} from '@spectrum-web-components/base';

import '@spectrum-web-components/icons-ui/icons/sp-icon-checkmark100.js';
import { ActionButton } from '@spectrum-web-components/action-button';

import menuItemStyles from './menu-item.css.js';
import checkmarkStyles from '@spectrum-web-components/icon/src/spectrum-icon-checkmark.css.js';
import { Menu } from './Menu.js';

/**
 * Spectrum Menu Item Component
 * @element sp-menu-item
 * @slot value - content placed at the end of the Menu Item like values, keyboard shortcuts, etc.
 * @fires sp-menu-item-added - announces the item has been added so a parent menu can take ownerships
 * @fires sp-menu-item-removed - announces when removed from the DOM so the parent menu can remove ownership and update selected state
 */
export class MenuItem extends ActionButton {
    public static get styles(): CSSResultArray {
        return [menuItemStyles, checkmarkStyles];
    }

    static instanceCount = 0;

    @property({ type: Boolean, reflect: true })
    public focused = false;

    @property({
        type: Boolean,
        reflect: true,
        attribute: 'no-wrap',
        hasChanged() {
            return false;
        },
    })
    public noWrap = false;

    /**
     * Hide this getter from web-component-analyzer until
     * https://github.com/runem/web-component-analyzer/issues/131
     * has been addressed.
     *
     * @private
     */
    public get itemText(): string {
        return (this.textContent || /* c8 ignore next */ '').trim();
    }

    protected get buttonContent(): TemplateResult[] {
        const content = super.buttonContent;
        content.push(
            html`
                <slot name="value"></slot>
            `
        );
        if (this.selected) {
            content.push(html`
                <sp-icon-checkmark100
                    id="selected"
                    class="spectrum-UIIcon-Checkmark100 icon"
                ></sp-icon-checkmark100>
            `);
        }
        return content;
    }

    protected renderButton(): TemplateResult {
        return html`
            ${this.buttonContent}
        `;
    }

    protected firstUpdated(changes: PropertyValues): void {
        this.setAttribute('tabindex', '-1');
        super.firstUpdated(changes);
        if (!this.hasAttribute('id')) {
            this.id = `sp-menu-item-${MenuItem.instanceCount++}`;
        }
    }

    updateAriaSelected(): void {
        const role = this.getAttribute('role');
        if (role === 'option') {
            this.setAttribute(
                'aria-selected',
                this.selected ? 'true' : 'false'
            );
        } else if (role === 'menuitemcheckbox' || role === 'menuitemradio') {
            this.setAttribute('aria-checked', this.selected ? 'true' : 'false');
        }
    }

    public setRole(role: string): void {
        this.setAttribute('role', role);
        this.updateAriaSelected();
    }

    protected updated(changes: PropertyValues): void {
        super.updated(changes);
        if (changes.has('selected')) {
            this.updateAriaSelected();
        }
    }

    public connectedCallback(): void {
        super.connectedCallback();
        const addedEvent = new CustomEvent('sp-menu-item-added', {
            bubbles: true,
            composed: true,
            detail: {
                item: this,
                owned: false,
                focusable: true,
            },
        });
        this.dispatchEvent(addedEvent);
    }

    public disconnectedCallback(): void {
        super.disconnectedCallback();
        const removedEvent = new CustomEvent('sp-menu-item-removed', {
            bubbles: true,
            composed: true,
            detail: {
                item: this,
            },
        });
        this.dispatchEvent(removedEvent);
    }

    // protected itemInsertResolver!: Promise<unknown[]>;

    protected async _getUpdateComplete(): Promise<void> {
        await super._getUpdateComplete();
        // await this.itemInsertResolver;
    }

    public async triggerUpdate(): Promise<void> {
        await new Promise((ready) => requestAnimationFrame(ready));
        const updatedEvent = new CustomEvent('sp-menu-item-update', {
            bubbles: true,
            composed: true,
            detail: {
                item: this,
                owned: false,
                focusable: true,
            },
        });
        this.dispatchEvent(updatedEvent);
    }
}

export interface MenuItemUpdateEvent {
    item: MenuItem;
    owned: boolean;
    focusable: boolean;
    focusRoot: Menu;
}

declare global {
    interface GlobalEventHandlersEventMap {
        'sp-menu-item-added': CustomEvent<MenuItemUpdateEvent>;
        'sp-menu-item-update': CustomEvent<MenuItemUpdateEvent>;
        'sp-menu-item-removed': CustomEvent<MenuItemUpdateEvent>;
    }
}

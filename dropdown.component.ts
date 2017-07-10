import {
    Component, OnInit, ElementRef, AfterViewInit, Input, OnDestroy, OnChanges, SimpleChanges, SimpleChange,
    ViewEncapsulation, EventEmitter, Output, Renderer2
} from '@angular/core';
import { isNullOrUndefined } from 'util';
import { CustomDropdownPipe } from './dropdown.pipe';
import { DropdownMetaData } from './dropdown';

@Component({
    providers: [CustomDropdownPipe],
    selector: '[custom-dropdown]',
    templateUrl: './dropdown.component.html',
    styleUrls: ['./dropdown.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class DropdownComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
    initScrollContainer: Function;
    initKeyboardNavigation: Function;
    itemsList: DropdownMetaData[] = [];
    searchItem = '';
    selectedItem = {};
    selectedDropdownItem: DropdownMetaData;

    @Input() data: any[];
    @Input() dataTextField: string;
    @Input() dataValueField: number;
    @Input() isSearchEnabled: boolean;
    @Input() selectedModel: any;
    @Input() themeColor: string;
    @Output() onSelection: EventEmitter<any> = new EventEmitter();
    @Output() onTouched: EventEmitter<any> = new EventEmitter();

    constructor(private elementRef: ElementRef, private renderer: Renderer2) {
        this.selectedDropdownItem = new DropdownMetaData('', 0);
    }

    mapObjectToItemList(data) {
        const ctrl = this;
        this.itemsList = data.map(function (element) {
            return new DropdownMetaData(element[ctrl.dataTextField], element[ctrl.dataValueField]);
        });
    }

    mapModelToDropdownItem(model) {
        this.selectedDropdownItem = new DropdownMetaData(model[this.dataTextField], model[this.dataValueField]);
    }

    mapDropDownItemToModel(item) {
        const filteredValue = this.data.find(el => {
            return (el[this.dataValueField] === item.value);
        });
        return filteredValue;
    }

    // Checks if the dropdow item is selected or not
    checkIfSelectionIsEmpty(event) {
        if (event.target.value === '') {
            this.onTouched.emit(true);
        }
    }

    ngOnInit() {
    }

    //fires when the input data changes
    ngOnChanges(changes: SimpleChanges) {
        const data: SimpleChange = changes.data;
        if (!isNullOrUndefined(data) && data.currentValue.length > 0) {
            this.mapObjectToItemList(data.currentValue);
        }
        const selected: SimpleChange = changes.selectedModel;
        if (!isNullOrUndefined(selected) && selected.currentValue) {
            this.mapModelToDropdownItem(this.selectedModel);
        }
    }

    ngAfterViewInit() {
        this.initKeyboardNavigation = this.renderer.listen(this.elementRef.nativeElement.getElementsByClassName('searchBox')[0],
            'keydown', (evt) => {
                if (evt.which === 40 || evt.which === 9) {
                    const firstChild = this.elementRef.nativeElement.getElementsByClassName('dropdown-menu')[0].firstElementChild;
                    firstChild.focus();
                } else if (evt.which === 16 || evt.which === 17 || evt.which === 18) {
                    // do nothing
                    return true;
                }
            });
    }

    ngOnDestroy() {
        // removes listener
        this.initKeyboardNavigation();
    }

    onDropdownItemSelection(selection: any, event) {
        event.target.parentNode.blur();
        this.selectedDropdownItem = selection;
        this.searchItem = '';
        const filtered = this.mapDropDownItemToModel(this.selectedDropdownItem);
        this.onSelection.emit(filtered);
        this.onTouched.emit(false);
    }

    onInputBlur(event) {       
        this.renderer.removeClass(event.target.previousElementSibling, 'fa-search');
        this.renderer.addClass(event.target.previousElementSibling, 'fa-chevron-down');
        this.checkIfSelectionIsEmpty(event);
    }

    onIconClick(event) {
        event.target.nextElementSibling.focus();
    }

    onInputFocus(event) {
        this.renderer.removeClass(event.target.previousElementSibling, 'fa-chevron-down');
        this.renderer.addClass(event.target.previousElementSibling, 'fa-search');
    }
    onKeyDown(event, item) {
        event.stopPropagation();
        switch (event.which) {
            case 38:
                // arrow up
                isNullOrUndefined(event.target.previousElementSibling) ? event.preventDefault() :
                    event.target.previousElementSibling.focus();
                break;
            case 40:
                // arrow down
                isNullOrUndefined(event.target.nextElementSibling) ? event.preventDefault() : event.target.nextElementSibling.focus();
                break;
            case 9:
                // Tab
                if (isNullOrUndefined(event.target.nextElementSibling)) {
                    event.preventDefault();
                } else {
                    event.target.nextElementSibling.focus();
                }
                break;
            case 13:
                // enter key
                this.onDropdownItemSelection(item, event);
                this.renderer.removeClass(this.elementRef.nativeElement.getElementsByClassName('dropdown-menu')[0], 'open');
                break;
        }
        event.preventDefault();
    }

    toggleDropdown(event, inputText) {
        if (inputText.trim().length > 0) {
            this.renderer.addClass(this.elementRef.nativeElement.getElementsByClassName('dropdown-menu')[0], 'open');
        }
    }
}


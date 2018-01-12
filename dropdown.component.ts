import {
    Component, OnInit, ElementRef, AfterViewInit, Input, OnDestroy, OnChanges, SimpleChanges, SimpleChange,
    ViewEncapsulation, EventEmitter, Output, Renderer2, HostListener
} from '@angular/core';
import { isNullOrUndefined } from 'util';
import { CustomDropdownPipe } from './dropdown.pipe';
import { DropdownMetaData } from './dropdown';
import { CustomDropdownTruncatePipe } from './dropdown.truncate.pipe';
import { ScrollbarOptionsModel } from 'app/services/model/scrollbar-options.model';
import { dropDownScrollbarOptions } from 'app/shared/app.config';

@Component({
    providers: [CustomDropdownPipe, CustomDropdownTruncatePipe],
    selector: '[custom-dropdown]',
    templateUrl: './dropdown.component.html',
    styleUrls: ['./dropdown.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class DropdownComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
    public scrollbarOptions: ScrollbarOptionsModel = dropDownScrollbarOptions;
    initScrollContainer: Function;
    initKeyboardNavigation: Function;
    inputSearchBox: any;
    itemsList: DropdownMetaData[] = [];
    searchItem = '';
    selectedItem = {};
    selectedDropdownItem: DropdownMetaData;
    isBinded: boolean = false;
    @Input() data?: any[] = [];
    @Input() dataTextField: string;
    @Input() dataValueField: number;
    @Input() isSearchEnabled: boolean;
    @Input() selectedModel?: any;
    @Input() themeColor: string;
    @Input() isYear: boolean;
    @Output() onSelection: EventEmitter<any> = new EventEmitter();
    @Output() onTouched: EventEmitter<any> = new EventEmitter();

    constructor(private elementRef: ElementRef, private renderer: Renderer2) {
        this.selectedDropdownItem = new DropdownMetaData('', 0);
    }

    mapObjectToItemList(data) {
        this.itemsList = [];
        const ctrl = this;
        if (data.length > 0) {
            this.itemsList = data.map(function (element) {
                return new DropdownMetaData(element[ctrl.dataTextField], element[ctrl.dataValueField]);
            });
        }
    }

    mapModelToDropdownItem(model) {
        if (Object.keys(model).length !== 0) {
            this.selectedDropdownItem = new DropdownMetaData(model[this.dataTextField], model[this.dataValueField]);

        } else {
            this.selectedDropdownItem = new DropdownMetaData('', 0);
        }
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
            if (this.inputSearchBox.classList.contains('active')) {
                this.renderer.removeClass(this.inputSearchBox, 'active');
            }
            this.onTouched.emit(true);
        }
    }

    ngOnInit() {
    }

    //fires when the input data changes
    ngOnChanges(changes: SimpleChanges) {
        const data: SimpleChange = changes.data;
        if (data && data.currentValue) {
            if (data.currentValue) {

                this.mapObjectToItemList(data.currentValue);
            }
        }
        const selected: SimpleChange = changes.selectedModel;
        if (selected && !isNullOrUndefined(selected.currentValue)) {
            this.mapModelToDropdownItem(this.selectedModel);

        }
    }

    ngAfterViewInit() {
        this.inputSearchBox = this.elementRef.nativeElement.getElementsByClassName('searchBox')[0];
        this.initKeyboardNavigation = this.renderer.listen(this.elementRef.nativeElement.getElementsByClassName('searchBox')[0],
            'keydown', (evt) => {
                if (evt.which === 40 || evt.which === 9) {
                    const firstChild = this.elementRef.nativeElement.getElementsByClassName('no_border')[0].firstElementChild;
                    firstChild.focus();
                    this.onTouched.emit(false);
                } else if (evt.which === 32) {
                    const child = this.elementRef.nativeElement.getElementsByClassName('dropdown')[0];
                    this.renderer.addClass(child, 'open');
                    const firstChild = this.elementRef.nativeElement.getElementsByClassName('no_border')[0].firstElementChild;
                    firstChild.focus();
                    this.onTouched.emit(false);
                } else if (evt.which === 16 || evt.which === 17 || evt.which === 18) {
                    // do nothing
                    return true;
                }
            });
    }

    ngOnDestroy() {
        // removes listener
        //this.initKeyboardNavigation();
    }

    onDropdownItemSelection(selection: any, event) {
        this.searchItem = '';
        event.target.parentNode.blur();
        this.selectedDropdownItem = selection;
        const filtered = this.mapDropDownItemToModel(this.selectedDropdownItem);
        this.elementRef.nativeElement.getElementsByClassName('searchBox')[0].value = this.selectedDropdownItem.label;
        this.onSelection.emit(filtered);
        this.onTouched.emit(false);
    }


    onInputBlur(event) {
        this.renderer.removeClass(event.target.nextElementSibling, 'fa-search');
        this.renderer.addClass(event.target.nextElementSibling, 'fa-chevron-down');
        this.checkIfSelectionIsEmpty(event);
    }

    onIconClick(event) {
        event.target.previousElementSibling.focus();
    }

    onInputFocus(event) {
        this.renderer.removeClass(event.target.nextElementSibling, 'fa-chevron-down');
        this.renderer.addClass(event.target.nextElementSibling, 'fa-search');
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
                this.onTouched.emit(false);
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
                this.renderer.removeClass(this.elementRef.nativeElement.getElementsByClassName('dropdown')[0], 'open');
                break;
        }
        event.preventDefault();
    }

    toggleDropdown(event, inputText) {
        if (inputText.trim().length > 0) {
            this.renderer.addClass(this.elementRef.nativeElement.getElementsByClassName('dropdown')[0], 'open');
        }
        else {
            this.renderer.removeClass(this.elementRef.nativeElement.getElementsByClassName('dropdown')[0], 'open');
        }
    }

    setComponentFocus(event, isActive: boolean) {
        if (event.which === 9) {
            if (isActive) {
                this.renderer.addClass(this.inputSearchBox, 'active');
            } else {
                this.renderer.removeClass(this.inputSearchBox, 'active');
            }
        }
    }

    ngDoCheck() {
        if (!this.isBinded && this.elementRef.nativeElement.getElementsByClassName('mCSB_scrollTools_vertical').length > 0 && this.elementRef.nativeElement.getElementsByClassName('mCSB_scrollTools_vertical')[0] != 'undefined') {
            this.isBinded = true;
            this.renderer.listen(this.elementRef.nativeElement.getElementsByClassName('mCSB_scrollTools_vertical')[0], 'click', (e) => {
                e.stopPropagation();
            });
        }
    }
}


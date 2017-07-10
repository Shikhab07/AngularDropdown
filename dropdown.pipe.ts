import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'dropdownpipe'})
export class CustomDropdownPipe implements PipeTransform {
  transform(value: any[], filter: string): Object[] {
    filter = filter ? filter.toLocaleLowerCase() : null;
    return filter ? value.filter((item: any) =>
    (item.label.toLocaleLowerCase().includes(filter)) || filter === '') : value;
  }
}

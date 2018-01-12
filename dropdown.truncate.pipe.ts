import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'dropdowntruncatepipe' })
export class CustomDropdownTruncatePipe implements PipeTransform {
    transform(value: string, args: string): string {
        const limit = parseInt(args, 10);
        return value.length > limit ? value.substring(limit, value.length) : value;
    }
}

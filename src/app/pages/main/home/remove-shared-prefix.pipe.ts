import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'removeSharedPrefix' })
export class RemoveSharedPrefixPipe implements PipeTransform {
  transform(value: string): string {
    if (value.startsWith('Shared Post:')) {
      return value.replace('Shared Post:', '').trim();
    }
    return value;
  }
}

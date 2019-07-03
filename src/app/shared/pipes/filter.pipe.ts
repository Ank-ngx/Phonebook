import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterBy',
  pure: false
})
export class FilterPipe implements PipeTransform {
  transform(items: any, filter: any, isAnd: any): any {
    if (filter) {
      if (filter && Array.isArray(items)) {
        let filterKeys = Object.keys(filter);
        if (isAnd) {
          return items.filter(item =>
            filterKeys.reduce((memo, keyName) =>
              (memo && new RegExp(filter[keyName], 'gi').test(item[keyName])) || filter[keyName] === "", true));
        } else {
          return items.filter(item => {
            return filterKeys.some((keyName) => {
              return new RegExp(filter[keyName], 'gi').test(item[keyName]) || filter[keyName] === "";
            });
          });
        }
      } else {
        return items;
      }
    } else {
      return items;
    }
  }
}

import { TCustomEntityColumn } from '@cromwell/core';
import React from 'react';

import { Autocomplete } from '../../../inputs/AutocompleteInput';
import { Datepicker } from '../../../inputs/DateInput';
import { TextInputField } from '../../../inputs/TextInput';
import styles from '../EntityTable.module.scss';
import { TGetAutocompleteValueFromSearch } from './TableHeader';

export function SearchContent(props: {
  columnSearch: TCustomEntityColumn | null;
  currentSearchRef: { current: string | number | boolean | Date | null }
  getAutocompleteValueFromSearch: TGetAutocompleteValueFromSearch;
}) {
  const { columnSearch, currentSearchRef } = props;

  if (columnSearch?.searchOptions) {
    // Select
    return (
      <Autocomplete
        multiple={columnSearch.multipleOptions}
        options={columnSearch.searchOptions}
        inlineOptions
        getOptionLabel={(option: any) => option?.label ?? ''}
        defaultValue={props.getAutocompleteValueFromSearch(currentSearchRef.current, columnSearch)}
        className={styles.filterItem}
        onChange={(event, newVal) => {
          if (Array.isArray(newVal)) newVal = JSON.stringify(newVal.map(val => typeof val === 'object' ? val?.value : val));
          currentSearchRef.current = typeof newVal === 'object' ? newVal?.value : newVal
        }}
        classes={{ popper: styles.autocompletePopper }}
        label={`Search ${columnSearch?.label ?? ''}`}
      />
    );
  }

  if (columnSearch?.type === 'Date' || columnSearch?.type === 'Datetime') {
    // Datepicker range
    return (
      <Datepicker
        defaultValue={JSON.parse(String(currentSearchRef.current || '[]'))}
        onChange={(value) => currentSearchRef.current = JSON.stringify(value)}
        range
      />
    );
  }

  return (
    <TextInputField
      onChange={(event) => currentSearchRef.current = event.target.value}
      label={`Search ${columnSearch?.label ?? ''}`}
      defaultValue={currentSearchRef.current as string}
    />
  )
}

//
// Copyright 2020 Wireline, Inc.
//

export const underlineMark = {
  parseDOM: [
    { tag: 'u' },
    {
      style: 'text-decoration',
      getAttrs: value => value === 'underline'
    }
  ],
  toDOM () {
    return ['u', 0];
  }
};
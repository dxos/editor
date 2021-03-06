//
// Copyright 2020 DXOS.org
//

import React, { Component } from 'react';

import { Editor } from '../src';

class ContextMenu extends Component {
  handleGetOptions = () => {
    return [
      { subheader: 'First subheader' },
      { id: 1, label: 'Item 1' },
      { id: 2, label: 'Item 2' },
      { subheader: 'Second subheader' },
      { id: 3, label: 'Item 3' },
      { id: 4, label: 'Item 4' }
    ];
  };

  handleOptionSelect = async (option, view) => {
    const { tr } = view.state;

    view.state.selection.replaceWith(tr, view.state.schema.text(option.label));

    view.dispatch(tr);
  };

  render () {
    return (
      <Editor
        contextMenu={{
          getOptions: this.handleGetOptions,
          onSelect: this.handleOptionSelect,
          emptyOptionsLabel: 'NO OPTIONS HERE TO SHOW',
          maxVisibleItems: 3
        }}
      />
    );
  }
}

export default ContextMenu;

import React, { Component } from 'react';
import { storiesOf } from '@storybook/react';
import * as Y from 'yjs';

import Editor from '../../Editor';
import Channel from '../../Channel';

import CssBaseline from '@material-ui/core/CssBaseline';
import { MuiThemeProvider, createMuiTheme, withStyles } from '@material-ui/core/styles';

import { grey } from '@material-ui/core/colors';

import ListItemText from '@material-ui/core/ListItemText';
import { Button, Grid } from '@material-ui/core';
import { getContentAsMarkdown } from '@wirelineio/yjs-helpers';

const FullViewport = story => (
  <div style={{ width: '100%', height: '500px', display: 'flex' }}>
    {story()}
  </div>
);

const MuiTheme = story => (
  <MuiThemeProvider theme={createMuiTheme()}>
    <CssBaseline />
    {story()}
  </MuiThemeProvider>
);

const style = () => ({
  contextMenuItemText: {
    fontSize: 12,
    padding: 0
  },

  contextMenuItemTextRight: {
    float: 'right',
    marginLeft: 5,
    color: grey[500],
    textTransform: 'Capitalize'
  }
});

class BasicEditor extends Component {

  handleShowMarkdown = () => {
    const { doc } = this.props;

    console.log(getContentAsMarkdown(doc));
  }

  render() {
    const {
      id,
      doc,
      contentChannel,
      statusChannel,
      onGetUsername,
      onContextMenuGetOptions,
      onContextMenuOptionSelect,
      onContextMenuRenderItem
    } = this.props;

    if (!doc) return 'Loading...';

    return (
      <Grid>
        <Editor
          doc={doc}
          contentSync={{
            channel: contentChannel
          }}
          statusSync={{
            id,
            getUsername: onGetUsername,
            channel: statusChannel
          }}
          contextMenu={{
            getOptions: onContextMenuGetOptions,
            onSelect: onContextMenuOptionSelect,
            renderItem: onContextMenuRenderItem
          }}
        />
        <Button onClick={this.handleShowMarkdown} >Log markdown</Button>
      </Grid>
    );
  }
}

class BasicSync extends Component {
  state = {
    editors: undefined
  };

  componentDidMount() {
    const { editorsCount } = this.props;

    const editors = Array.from({ length: editorsCount }).reduce(
      (editors, _, idx) => {
        editors[idx] = this.createEditor(idx, `editor-${idx}`);
        return editors;
      },
      {}
    );

    this.setState({ editors });
  }

  createEditor = (id, username) => {
    // View's doc mock
    const doc = new Y.Doc();

    const contentChannel = new Channel();
    const statusChannel = new Channel();

    contentChannel.on('local', data => {
      const { editors } = this.state;

      // Update view's doc
      Y.applyUpdate(doc, data.update, data.origin);

      Object.values(editors)
        .filter(editor => editor.id !== id)
        .forEach(editor => {
          editor.contentChannel.receive({ ...data, author: editor.id });
        });
    });

    statusChannel.on('local', data => {
      const { editors } = this.state;

      Object.values(editors)
        .filter(editor => editor.id !== id)
        .forEach(editor => {
          editor.statusChannel.receive(data);
        });
    });

    return {
      id,
      username,
      doc,
      contentChannel,
      statusChannel
    };
  };

  handleGetUsername = editorId => id => {
    const { editors } = this.state;

    if (!id) return editors[editorId].username;

    return editors[id].username;
  };

  handleContextMenuGetOptions = () => {
    return [
      { id: 1, label: 'Insert some text' },
      { id: 2, label: 'Insert some text 2' }
    ];
  };

  handleContextMenuRenderItem = ({ option }) => {
    const { classes } = this.props;

    return (
      <ListItemText
        primary={<>{option.label}</>}
        className={classes.contextMenuItemText}
      />
    );
  };

  handleContextMenuOptionSelect = async (option, view) => {
    const { tr } = view.state;

    view.state.selection.replaceWith(tr, view.state.schema.text('-SOME TEXT-'));

    view.dispatch(tr);
  };

  render() {
    const { editors } = this.state;

    if (!editors) return 'Loading...';

    return Object.values(editors).map(editor => {
      return (
        <BasicEditor
          key={editor.id}
          onGetUsername={this.handleGetUsername(editor.id)}
          onContextMenuGetOptions={this.handleContextMenuGetOptions}
          onContextMenuOptionSelect={this.handleContextMenuOptionSelect}
          onContextMenuRenderItem={this.handleContextMenuRenderItem}
          {...editor}
        />
      );
    });
  }
}

const BasicSyncWithStyles = withStyles(style)(BasicSync);

storiesOf('Editor', module)
  .addDecorator(MuiTheme)
  .addDecorator(FullViewport)
  .add('Basic', () => <BasicSyncWithStyles editorsCount={1} />);
